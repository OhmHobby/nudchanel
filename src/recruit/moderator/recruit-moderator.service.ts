import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ProfileIdModel } from 'src/accounts/models/profile-id.model'
import { RecruitRoleModeratorEntity } from 'src/entities/recruit/recruit-role-moderator.entity'
import { RecruitRoleEntity } from 'src/entities/recruit/recruit-role.entity'
import { Repository } from 'typeorm'

@Injectable()
export class RecruitModeratorService {
  private readonly logger = new Logger(RecruitModeratorService.name)

  constructor(
    @InjectRepository(RecruitRoleModeratorEntity)
    private readonly roleModeratorRepository: Repository<RecruitRoleModeratorEntity>,
  ) {}

  async getManageableRecruitId(profileId?: ProfileIdModel): Promise<string[]> {
    if (!profileId) return []
    try {
      const rows = await this.roleModeratorRepository
        .createQueryBuilder('rrm')
        .select('rr.recruit_id', 'recruitId')
        .distinct(true)
        .innerJoin('rrm.role', 'rr')
        .where('rrm.profile_id = :profileId', { profileId: profileId.uuid })
        .getRawMany<Pick<RecruitRoleEntity, 'recruitId'>>()
      return rows.map((el) => el.recruitId)
    } catch (err) {
      this.logger.error(`Could not get manageable recruit id for ${profileId.uuid}: ${err.message}`, err)
      return []
    }
  }
}
