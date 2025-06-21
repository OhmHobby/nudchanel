import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { RecruitSettingEntity } from 'src/entities/recruit/recruit-setting.entity'

const MIN_YEAR = 1900

export class CreateRecruitSettingDto {
  @ApiProperty()
  @IsNumber()
  @Min(MIN_YEAR)
  year: number

  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  openWhen: Date

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  closeWhen: Date

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  announceWhen: Date

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maximumRole?: number

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  toEntity(): RecruitSettingEntity {
    return new RecruitSettingEntity({
      year: this.year,
      name: this.name,
      openWhen: this.openWhen,
      closeWhen: this.closeWhen,
      announceWhen: this.announceWhen,
      maximumRole: this.maximumRole ?? 1,
      isActive: this.isActive ?? false,
    })
  }
}
