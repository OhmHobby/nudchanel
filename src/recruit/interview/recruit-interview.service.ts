import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import dayjs from 'dayjs'
import { calendar_v3 } from 'googleapis'
import { ProfileService } from 'src/accounts/profile/profile.service'
import { RecruitInterviewSlotEntity } from 'src/entities/recruit/recruit-interview-slot.entity'
import { RecruitRoleEntity } from 'src/entities/recruit/recruit-role.entity'
import { Config } from 'src/enums/config.enum'
import { GoogleCalendarService } from 'src/google/google-calendar.service'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { DataSource, In, IsNull, Repository } from 'typeorm'
import { RecruitApplicantService } from '../applicant/recruit-applicant.service'
import { RecruitFormService } from '../form/recruit-form.service'
import { RecruitApplicantModel } from '../models/recruit-applicant.model'
import { RecruitInterviewSlotDetailModel } from '../models/recruit-interview-slot-detail.model'
import { RecruitInterviewSlotModel } from '../models/recruit-interview-slot.model'
import { RecruitRoleModel } from '../models/recruit-role.model'
import { RecruitModeratorService } from '../moderator/recruit-moderator.service'
import { RecruitRoleService } from '../role/recruit-role.service'

@Injectable()
export class RecruitInterviewService {
  private readonly logger = new Logger(RecruitInterviewService.name)

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(RecruitInterviewSlotEntity)
    private readonly interviewSlotRepostory: Repository<RecruitInterviewSlotEntity>,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => RecruitApplicantService))
    private readonly applicantService: RecruitApplicantService,
    @Inject(forwardRef(() => RecruitRoleService))
    private readonly roleService: RecruitRoleService,
    @Inject(forwardRef(() => RecruitFormService))
    private readonly formService: RecruitFormService,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly recruitModeratorService: RecruitModeratorService,
    private readonly profileService: ProfileService,
  ) {}

  async getRange(recruitId: string): Promise<{ start: Date; end: Date } | undefined> {
    return await this.interviewSlotRepostory
      .createQueryBuilder('ris')
      .select('min(start_when)', 'start')
      .addSelect('max(end_when)', 'end')
      .innerJoin(RecruitRoleEntity, 'rr', 'rr.recruit_id = :recruitId AND rr.id = ris.role_id', { recruitId })
      .getRawOne<{ start: Date; end: Date }>()
  }

  async getSlots(
    recruitId: string,
    applicantId?: string,
    isShowDetails = false,
  ): Promise<RecruitInterviewSlotDetailModel[]> {
    const [rawSlots, applicant, mandatoryRoleIds, applicants] = await Promise.all([
      this.interviewSlotRepostory.find({
        where: { role: { recruitId } },
        relations: { role: true },
        order: { startWhen: 'asc' },
      }),
      this.applicantService.findOne(applicantId),
      applicantId ? this.roleService.getMandatoryInterviewRoleIds(recruitId) : Promise.resolve([]),
      isShowDetails
        ? await this.applicantService.getRecruitApplicantModels(undefined, recruitId, undefined)
        : Promise.resolve([] as RecruitApplicantModel[]),
    ])
    const applicantKv = Object.fromEntries(applicants.map((el) => [el.id, el]))
    const groupedSlots = Object.groupBy(rawSlots, (el) => RecruitInterviewSlotModel.refId(el.startWhen, el.endWhen))
    const mergedSlots = Object.values(groupedSlots).map((slots: RecruitInterviewSlotEntity[]) => {
      const baseSlot = slots.at(0)!
      return new RecruitInterviewSlotDetailModel({
        start: baseSlot.startWhen,
        end: baseSlot.endWhen,
        roles: isShowDetails ? (slots.map((slot) => RecruitRoleModel.fromEntity(slot.role!)) ?? []) : undefined,
        interviewedAt: isShowDetails ? (baseSlot.interviewAt ?? undefined) : undefined,
        isAvailable: this.isSlotAvailable(slots, applicant?.roles?.map((el) => el.role!.id)?.concat(mandatoryRoleIds)),
        isSelected: applicantId ? this.isSelectedSlot(slots, applicantId) : undefined,
        applicants: isShowDetails
          ? [...new Set(slots.map((el) => el.applicantId))]
              .map((applicantId) => (applicantId ? applicantKv[applicantId] : undefined))
              .filter((el) => !!el)
          : undefined,
      })
    })
    return mergedSlots
  }

  getSelectedSlots(applicantId: string) {
    return this.interviewSlotRepostory.find({
      where: { applicantId },
    })
  }

  isSelectedSlot(sameGroupSlots: RecruitInterviewSlotEntity[], applicantId: string): boolean {
    return sameGroupSlots.some((el) => el.applicantId === applicantId)
  }

  isSlotAvailable(sameGroupSlots: RecruitInterviewSlotEntity[], requestRoleIds?: string[]): boolean | undefined {
    const availableRoleId = new Set(sameGroupSlots.filter((slot) => !slot.applicantId).map((el) => el.roleId))
    return (
      this.isValidLeadTime(sameGroupSlots[0]?.startWhen) &&
      requestRoleIds?.every((reqRoleIds) => availableRoleId.has(reqRoleIds))
    )
  }

  isValidLeadTime(slotStartTime: Date, currentTime = new Date()) {
    return (
      dayjs(slotStartTime).diff(currentTime, 'hours') >=
      +this.configService.getOrThrow(Config.RECRUIT_INTERVIEW_MINIMUM_BOOKING_LEAD_TIME_HOURS)
    )
  }

  leadTimePrecheck(slotStartTime: Date) {
    if (!this.isValidLeadTime(slotStartTime)) {
      throw new ConflictException()
    }
  }

  applicantBookingPrecheck(isFormCompleted: boolean, numberOfApplyRoles: number) {
    if (!numberOfApplyRoles) {
      throw new UnprocessableEntityException('No selected roles')
    }
    if (!isFormCompleted) {
      throw new UnprocessableEntityException('Forms are not completed')
    }
  }

  isRebookSameSlot(slots: RecruitInterviewSlotEntity[], roleIds: string[], startWhen: Date, endWhen: Date): boolean {
    return (
      slots.at(0)?.startWhen === startWhen &&
      slots.at(0)?.endWhen === endWhen &&
      !!roleIds.length &&
      slots.length === roleIds.length &&
      slots.every((el) => roleIds.includes(el.roleId!))
    )
  }

  async bookSlot(recruitId: string, applicantId: string, startWhen?: Date, endWhen?: Date) {
    const [selectedSlots, isFormCompleted, mandatoryRoleIds, selectedRoleIds] = await Promise.all([
      this.getSelectedSlots(applicantId),
      this.formService.isApplicantFormCompleted(applicantId, recruitId),
      this.roleService.getMandatoryInterviewRoleIds(recruitId),
      this.applicantService.getSelectedRoleIds(applicantId),
    ])
    const roleIds = [mandatoryRoleIds, selectedRoleIds].flat()
    startWhen = startWhen ?? selectedSlots?.at(0)?.startWhen
    endWhen = endWhen ?? selectedSlots?.at(0)?.endWhen
    if (!startWhen || !endWhen) throw new InternalServerErrorException(`Missing slot's start/end time`)
    this.applicantBookingPrecheck(isFormCompleted, selectedRoleIds.length)
    if (this.isRebookSameSlot(selectedSlots, roleIds, startWhen, endWhen)) return
    this.leadTimePrecheck(startWhen)
    const event = await this.dataSource.transaction(async (manager) => {
      await this.cancelSlot(applicantId, manager.getRepository(RecruitInterviewSlotEntity))
      const result = await manager.getRepository(RecruitInterviewSlotEntity).update(
        {
          roleId: In(roleIds),
          startWhen,
          endWhen,
          applicantId: IsNull(),
        },
        { applicantId },
      )
      if (roleIds.length !== result.affected) {
        this.logger.warn({
          message: `Failed to book a slot for ${applicantId} from ${startWhen} to ${endWhen}: ${result.affected} of ${roleIds.length} available`,
          roleIds,
        })
        throw new ConflictException()
      }
      return await this.createCalendarEvent(applicantId, startWhen, endWhen, roleIds)
    })
    if (event?.id) {
      try {
        await this.interviewSlotRepostory.update(
          { applicantId },
          { googleCalendarEventId: event.id, conferenceUri: event.conferenceData?.entryPoints?.at(0)?.uri ?? null },
        )
      } catch (err) {
        this.logger.error(`Failed to update interview slot for ${applicantId}`, err)
      }
    }
  }

  async rebookSlot(recruitId: string, applicantId: string) {
    try {
      await this.bookSlot(recruitId, applicantId)
    } catch (err) {
      this.logger.error(`Failed to rebook slot for ${applicantId}`, err)
      await this.cancelSlot(applicantId)
    }
  }

  async cancelSlot(applicantId: string, repository?: Repository<RecruitInterviewSlotEntity>) {
    await this.cancelCalendarEvent(applicantId)
    const result = await (repository ?? this.interviewSlotRepostory).update(
      { applicantId, interviewAt: IsNull() },
      { applicantId: null, googleCalendarEventId: null, conferenceUri: null },
    )
    this.logger.debug(`Canceled interview slot for ${applicantId}: ${result.affected}`)
    return !!result.affected
  }

  async createCalendarEvent(
    applicantId: string,
    startWhen: Date,
    endWhen: Date,
    roleIds: string[],
  ): Promise<calendar_v3.Schema$Event | undefined> {
    const createCalendar = this.configService.getOrThrow(Config.RECRUIT_INTERVIEW_CALENDAR_CREATE)
    if (!createCalendar) return
    const [applicants, roleModerators] = await Promise.all([
      this.applicantService.getRecruitApplicantModels(applicantId),
      this.recruitModeratorService.getRolesModeratorProfileIds(roleIds),
    ])
    const applicant = applicants.at(0)
    if (!applicant) throw new InternalServerErrorException(`Applicant not found: ${applicantId}`)
    const applicantProfileId = ObjectIdUuidConverter.toObjectId(applicant.profileId)
    const profileIds = [applicantProfileId, ...roleModerators]
    const attendeeEmails = await this.profileService.emailsFromProfileIds(profileIds)
    const applicantFullName = applicant.profileName?.fullname || undefined
    const createWithMeet = this.configService.getOrThrow(Config.RECRUIT_INTERVIEW_CALENDAR_MEET)
    const event = await this.googleCalendarService.create(
      startWhen,
      endWhen,
      this.getCalendarEventTitle(applicantFullName),
      this.getCalendarEventDescription(),
      attendeeEmails,
      createWithMeet,
    )
    return event
  }

  async cancelCalendarEvent(applicantId: string) {
    try {
      const slot = await this.interviewSlotRepostory.findOne({ where: { applicantId } })
      if (slot?.googleCalendarEventId) {
        await this.googleCalendarService.remove(slot.googleCalendarEventId)
      }
    } catch (err) {
      this.logger.error(`Failed to cancel calendar event for ${applicantId}`, err)
    }
  }

  getCalendarEventTitle(applicantFullName?: string) {
    const title = this.configService.getOrThrow(Config.RECRUIT_INTERVIEW_CALENDAR_TITLE)
    return applicantFullName ? `${title} (${applicantFullName})` : title
  }

  getCalendarEventDescription() {
    const description = this.configService.getOrThrow(Config.RECRUIT_INTERVIEW_CALENDAR_DESCRIPTION)
    return description
  }

  async addSlot(recruitId: string, startWhen: Date, endWhen: Date, roleIds: string[]) {
    const slots = roleIds.map((roleId) =>
      this.interviewSlotRepostory.create({
        startWhen,
        endWhen,
        roleId,
      }),
    )
    await this.interviewSlotRepostory.save(slots)
  }

  async removeSlot(recruitId: string, startWhen: Date, endWhen: Date, roleIds: string[]) {
    const slots = await this.interviewSlotRepostory.find({
      where: {
        startWhen,
        endWhen,
        roleId: In(roleIds),
      },
    })
    if (slots.some((slot) => slot.applicantId)) {
      throw new ConflictException('Cannot remove slot: one or more slots are already booked')
    }
    await this.interviewSlotRepostory.remove(slots)
  }
}
