import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator'

export class CreateRecruitFormQuestionDto {
  @ApiProperty()
  @IsUUID()
  collectionId: string

  @ApiProperty()
  @IsString()
  question: string

  @ApiProperty()
  @IsString()
  input: string

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
