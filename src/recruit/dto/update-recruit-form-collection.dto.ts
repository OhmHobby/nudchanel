import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateRecruitFormCollectionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string
}
