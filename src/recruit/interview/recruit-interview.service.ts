import { ConflictException, Injectable, Logger } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { RecruitInterviewSlotEntity } from 'src/entities/recruit/recruit-interview-slot.entity'
import { RecruitRoleEntity } from 'src/entities/recruit/recruit-role.entity'
import { DataSource, In, IsNull, Repository } from 'typeorm'
import { RecruitApplicantService } from '../applicant/recruit-applicant.service'
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
    private readonly applicantService: RecruitApplicantService,
    private readonly roleService: RecruitRoleService,
  ) {}

  async getRange(recruitId: string): Promise<Date[]> {
    const { start, end } = await this.interviewSlotRepostory
      .createQueryBuilder('ris')
      .select('min(start_when)', 'start')
      .addSelect('max(end_when)', 'end')
      .innerJoin(RecruitRoleEntity, 'rr', 'rr.recruit_id = :recruitId AND rr.id = ris.role_id', { recruitId })
      .getRawOne()
    return [start, end]
  }

  async getSlots(
    recruitId: string,
    applicantId?: string,
    isShowDetails = false,
  ): Promise<RecruitInterviewSlotDetailModel[]> {
    const [rawSlots, applicant, mandatoryRoleIds] = await Promise.all([
      this.interviewSlotRepostory.find({
        where: { role: { recruitId } },
        relations: { role: true, applicant: isShowDetails },
        order: { startWhen: 'asc' },
      }),
      this.applicantService.findOne(applicantId),
      applicantId ? this.roleService.getMandatoryInterviewRoleIds(recruitId) : Promise.resolve([]),
    ])
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
      })
    })
    return mergedSlots
  }

  isSelectedSlot(sameGroupSlots: RecruitInterviewSlotEntity[], applicantId: string): boolean {
    return sameGroupSlots.some((el) => el.applicantId === applicantId)
  }

  isSlotAvailable(sameGroupSlots: RecruitInterviewSlotEntity[], requestRoleIds?: string[]): boolean | undefined {
    const availableRoleId = new Set(sameGroupSlots.filter((slot) => !slot.applicantId).map((el) => el.roleId))
    return requestRoleIds?.every((reqRoleIds) => availableRoleId.has(reqRoleIds))
  }

  async bookSlot(recruitId: string, applicantId: string, startWhen: Date, endWhen: Date) {
    const [selectedRoleIds, mandatoryRoleIds] = await Promise.all([
      this.applicantService.getSelectedRoleIds(applicantId),
      this.roleService.getMandatoryInterviewRoleIds(recruitId),
    ])
    const roleIds = [selectedRoleIds, mandatoryRoleIds].flat()
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

  async cancelSlot(applicantId: string, repository?: Repository<RecruitInterviewSlotEntity>) {
    const result = await (repository ?? this.interviewSlotRepostory).update(
      { applicantId, interviewAt: IsNull() },
      { applicantId: null },
    )
    this.logger.debug(`Canceled interview slot for ${applicantId}: ${result.affected}`)
    return !!result.affected
  }
}
