import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { RecruitSettingEntity } from 'src/entities/recruit/recruit-setting.entity'

const MIN_YEAR = 1900

export class UpdateRecruitSettingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(MIN_YEAR)
  year?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  openWhen?: Date

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  closeWhen?: Date

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  announceWhen?: Date

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  maximumRole?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  applyToEntity(entity: RecruitSettingEntity): void {
    if (this.year !== undefined) entity.year = this.year
    if (this.name !== undefined) entity.name = this.name
    if (this.openWhen !== undefined) entity.openWhen = this.openWhen
    if (this.closeWhen !== undefined) entity.closeWhen = this.closeWhen
    if (this.announceWhen !== undefined) entity.announceWhen = this.announceWhen
    if (this.maximumRole !== undefined) entity.maximumRole = this.maximumRole
    if (this.isActive !== undefined) entity.isActive = this.isActive
  }
}
