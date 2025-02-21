import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Span } from 'nestjs-otel'
import { RecruitSettingEntity } from 'src/entities/recruit/recruit-setting.entity'
import { In, Repository } from 'typeorm'

@Injectable()
export class RecruitSettingService {
  private readonly logger = new Logger(RecruitSettingService.name)

  constructor(
    @InjectRepository(RecruitSettingEntity)
    private readonly settingRepostory: Repository<RecruitSettingEntity>,
  ) {}

  @Span()
  async getCurrentId(): Promise<string | undefined> {
    const setting = await this.settingRepostory.findOne({ where: { isActive: true }, select: { id: true } })
    return setting?.id
  }

  async getById(id: string) {
    return await this.settingRepostory.findOne({ where: { id } })
  }

  async list(ids?: string[]) {
    return await this.settingRepostory.find({ where: { id: ids ? In(ids) : undefined } })
  }
}
