import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class UpdateRecruitFormQuestionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  question?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  input?: string

  @ApiPropertyOptional({ type: String, isArray: true, nullable: true })
  @IsOptional()
  @IsArray()
  options?: string[] | null

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  rank?: number
}
