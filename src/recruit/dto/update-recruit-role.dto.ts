import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator'

export class UpdateRecruitRoleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string | null

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rank?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  mandatory?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  collectionId?: string | null
}
