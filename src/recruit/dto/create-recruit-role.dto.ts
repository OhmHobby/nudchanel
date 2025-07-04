import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID } from 'class-validator'

export class CreateRecruitRoleDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsString()
  description: string

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  icon?: string | null

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  rank?: number

  @ApiProperty()
  @IsBoolean()
  mandatory: boolean

  @ApiProperty()
  @IsUUID()
  recruitId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  collectionId?: string | null
}
