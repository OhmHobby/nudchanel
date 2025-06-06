import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { RecruitApplicantRoleEntity } from 'src/entities/recruit/recruit-applicant-role.entity'
import { RecruitApplicantEntity } from 'src/entities/recruit/recruit-applicant.entity'
import { RecruitRoleEntity } from 'src/entities/recruit/recruit-role.entity'
import { DataSource, IsNull, Repository } from 'typeorm'
import { RecruitInterviewService } from '../interview/recruit-interview.service'

@Injectable()
export class RecruitRoleService {
  private readonly logger = new Logger(RecruitRoleService.name)

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(RecruitRoleEntity)
    private readonly roleRepostory: Repository<RecruitRoleEntity>,
    @Inject(forwardRef(() => RecruitInterviewService))
    private readonly interviewService: RecruitInterviewService,
  ) {}

  async getByRecruitId(recruitId: string, includeMandatory?: boolean): Promise<RecruitRoleEntity[]> {
    return await this.roleRepostory.find({
      where: { recruitId, mandatory: includeMandatory ? undefined : false },
      order: { rank: 'ASC' },
      select: {
        id: true,
        name: true,
        description: true,
        rank: true,
        mandatory: includeMandatory,
        collectionId: true,
      },
    })
  }

  async getMandatoryInterviewRoleIds(recruitId: string): Promise<string[]> {
    const roles = await this.roleRepostory.find({
      where: { recruitId, mandatory: true, collectionId: IsNull() },
      select: { id: true },
    })
    return roles.map((el) => el.id)
  }

  async selectRoles(applicant: RecruitApplicantEntity, roleIds: string[]): Promise<void> {
    const applicantId = applicant.id
    await this.dataSource.transaction(async (manager) => {
      const selectedRoles = await manager.getRepository(RecruitApplicantRoleEntity).find({
        where: { applicantId },
        order: { rank: 'asc' },
      })
      const updatedRoles = roleIds.map((roleId, rank) => {
        const role = selectedRoles.at(rank) ?? new RecruitApplicantRoleEntity()
        role.rank = rank
        role.applicantId = applicantId
        role.roleId = roleId
        return role
      })
      const toRemoveRoles = selectedRoles.slice(roleIds.length).map((role) => ({ id: role.id }))
      await Promise.all([
        updatedRoles.length ? manager.save(updatedRoles) : Promise.resolve(),
        toRemoveRoles.length ? manager.delete(RecruitApplicantRoleEntity, toRemoveRoles) : Promise.resolve(),
      ])
    })
    await this.interviewService.rebookSlot(applicant.recruitId, applicantId)
  }
}
