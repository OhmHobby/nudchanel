import { ForbiddenException, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Span } from 'nestjs-otel'
import { ProfileNameService } from 'src/accounts/profile/profile-name.service'
import { RecruitApplicantEntity } from 'src/entities/recruit/recruit-applicant.entity'
import { RecruitRoleModeratorEntity } from 'src/entities/recruit/recruit-role-moderator.entity'
import { RecruitRoleEntity } from 'src/entities/recruit/recruit-role.entity'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { ProfileNameModel } from 'src/models/accounts/profile.name.model'
import { ProfileId } from 'src/models/types'
import { In, Repository } from 'typeorm'

@Injectable()
export class RecruitModeratorService {
  private readonly logger = new Logger(RecruitModeratorService.name)

  constructor(
    @InjectRepository(RecruitApplicantEntity)
    private readonly applicantRepository: Repository<RecruitApplicantEntity>,
    @InjectRepository(RecruitRoleModeratorEntity)
    private readonly roleModeratorRepository: Repository<RecruitRoleModeratorEntity>,
    private readonly profileNameService: ProfileNameService,
  ) {}

  @Span()
  async getManageableRecruitId(profileId?: string): Promise<string[]> {
    if (!profileId) return []
    try {
      const rows = await this.roleModeratorRepository
        .createQueryBuilder('rrm')
        .select('rr.recruit_id', 'recruitId')
        .distinct(true)
        .innerJoin('rrm.role', 'rr')
        .where('rrm.profile_id = :profileId', { profileId })
        .getRawMany<Pick<RecruitRoleEntity, 'recruitId'>>()
      return rows.map((el) => el.recruitId)
    } catch (err) {
      this.logger.error(`Could not get manageable recruit id for ${profileId}: ${err.message}`, err)
      return []
    }
  }

  async getApplicantRecruitId(applicantId: string): Promise<string | null> {
    const applicant = await this.applicantRepository.findOne({
      where: { id: applicantId },
      select: { recruitId: true },
    })
    return applicant?.recruitId ?? null
  }

  async getRoleModerators(roleId: string): Promise<ProfileNameModel[]> {
    const mods = await this.roleModeratorRepository.find({ where: { roleId }, select: { profileId: true } })
    const profiles = await this.profileNameService.getProfilesName(
      mods.map((mod) => ObjectIdUuidConverter.toObjectId(mod.profileId)),
    )
    return profiles
  }

  async getRolesModeratorProfileIds(roleIds: string[]): Promise<ProfileId[]> {
    const mods = await this.roleModeratorRepository.find({
      where: { roleId: In(roleIds) },
      select: { profileId: true },
    })
    return mods.map((mod) => ObjectIdUuidConverter.toObjectId(mod.profileId))
  }

  async getModeratorRoles(profileId: string): Promise<RecruitRoleEntity[]> {
    const mods = await this.roleModeratorRepository.find({ where: { profileId }, relations: { role: true } })
    return mods.map((mod) => mod.role!)
  }

  async addRoleModerator(roleId: string, profileId: string) {
    await this.roleModeratorRepository.upsert(
      { roleId, profileId },
      { conflictPaths: { roleId: true, profileId: true } },
    )
  }

  async removeRoleModerator(roleId: string, profileId: string) {
    await this.roleModeratorRepository.delete({ roleId, profileId })
  }

  async hasPermissionToApplicantOrThrow(profileId: string, applicantId?: string) {
    if (!applicantId) return
    const [managableIds, targetId] = await Promise.all([
      this.getManageableRecruitId(profileId),
      this.getApplicantRecruitId(applicantId),
    ])
    if (!targetId || !managableIds.includes(targetId)) throw new ForbiddenException()
  }
}
