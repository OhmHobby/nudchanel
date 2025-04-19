import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RecruitRoleEntity } from 'src/entities/recruit/recruit-role.entity'
import { Repository } from 'typeorm'

@Injectable()
export class RecruitRoleService {
  private readonly logger = new Logger(RecruitRoleService.name)

  constructor(
    @InjectRepository(RecruitRoleEntity)
    private readonly roleRepostory: Repository<RecruitRoleEntity>,
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
}
