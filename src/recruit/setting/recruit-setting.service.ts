import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Span } from 'nestjs-otel'
import { RecruitSettingEntity } from 'src/entities/recruit/recruit-setting.entity'
import { In, Repository } from 'typeorm'
import { CreateRecruitSettingDto } from '../dto/create-recruit-setting.dto'
import { UpdateRecruitSettingDto } from '../dto/update-recruit-setting.dto'

@Injectable()
export class RecruitSettingService {
  private readonly logger = new Logger(RecruitSettingService.name)

  constructor(
    @InjectRepository(RecruitSettingEntity)
    private readonly settingRepostory: Repository<RecruitSettingEntity>,
  ) {}

  @Span()
  async getCurrentSetting(): Promise<RecruitSettingEntity | null> {
    const setting = await this.settingRepostory.findOne({ where: { isActive: true } })
    return setting
  }

  @Span()
  async getById(id: string): Promise<RecruitSettingEntity | null> {
    return await this.settingRepostory.findOne({ where: { id } })
  }

  async list(ids?: string[]) {
    return await this.settingRepostory.find({ where: { id: ids ? In(ids) : undefined } })
  }

  private validateDateOrder(openWhen: Date, closeWhen: Date, announceWhen: Date): void {
    if (closeWhen <= openWhen) {
      throw new BadRequestException('closeWhen must be after openWhen')
    }
    if (announceWhen <= closeWhen) {
      throw new BadRequestException('announceWhen must be after closeWhen')
    }
  }

  private async deactivateOtherSettings(): Promise<void> {
    await this.settingRepostory.update({ isActive: true }, { isActive: false })
  }

  @Span()
  async create(dto: CreateRecruitSettingDto): Promise<RecruitSettingEntity> {
    this.validateDateOrder(dto.openWhen, dto.closeWhen, dto.announceWhen)

    const setting = dto.toEntity()

    if (setting.isActive) {
      await this.deactivateOtherSettings()
    }

    return await this.settingRepostory.save(setting)
  }

  @Span()
  async update(id: string, dto: UpdateRecruitSettingDto): Promise<RecruitSettingEntity> {
    const setting = await this.getById(id)
    if (!setting) {
      throw new NotFoundException('Recruit setting not found')
    }

    if (dto.openWhen || dto.closeWhen || dto.announceWhen) {
      const openWhen = dto.openWhen ?? setting.openWhen
      const closeWhen = dto.closeWhen ?? setting.closeWhen
      const announceWhen = dto.announceWhen ?? setting.announceWhen
      this.validateDateOrder(openWhen, closeWhen, announceWhen)
    }

    dto.applyToEntity(setting)

    if (dto.isActive === true) {
      await this.deactivateOtherSettings()
    }

    return await this.settingRepostory.save(setting)
  }
}
