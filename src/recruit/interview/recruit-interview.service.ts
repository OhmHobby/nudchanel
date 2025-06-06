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
import { RecruitInterviewSlotEntity } from 'src/entities/recruit/recruit-interview-slot.entity'
import { RecruitRoleEntity } from 'src/entities/recruit/recruit-role.entity'
import { Config } from 'src/enums/config.enum'
import { DataSource, In, IsNull, Repository } from 'typeorm'
import { RecruitApplicantService } from '../applicant/recruit-applicant.service'
import { RecruitFormService } from '../form/recruit-form.service'
import { RecruitApplicantModel } from '../models/recruit-applicant.model'
import { RecruitInterviewSlotDetailModel } from '../models/recruit-interview-slot-detail.model'
import { RecruitInterviewSlotModel } from '../models/recruit-interview-slot.model'
import { RecruitRoleModel } from '../models/recruit-role.model'
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

  applicantBookingPrecheck(isFormCompleted: boolean, numberOfApplyRoles: number, slotStartTime: Date) {
    if (!numberOfApplyRoles) {
      throw new UnprocessableEntityException('No selected roles')
    }
    if (!isFormCompleted) {
      throw new UnprocessableEntityException('Forms are not completed')
    }
    if (!this.isValidLeadTime(slotStartTime)) {
      throw new ConflictException()
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
    if (this.isRebookSameSlot(selectedSlots, roleIds, startWhen, endWhen)) return
    this.applicantBookingPrecheck(isFormCompleted, selectedRoleIds.length, startWhen)
    return this.dataSource.transaction(async (manager) => {
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
    })
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
    const result = await (repository ?? this.interviewSlotRepostory).update(
      { applicantId, interviewAt: IsNull() },
      { applicantId: null },
    )
    this.logger.debug(`Canceled interview slot for ${applicantId}: ${result.affected}`)
    return !!result.affected
  }
}
