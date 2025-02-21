import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RecruitFormQuestionAnswerModel {
  constructor(model?: Partial<RecruitFormQuestionAnswerModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  id: string

  @ApiProperty()
  question: string

  @ApiProperty()
  input: string

  @ApiPropertyOptional({ type: String, isArray: true, nullable: true })
  options?: string[] | null

  @ApiProperty()
  rank: number

  @ApiPropertyOptional({ type: String, nullable: true })
  answer?: string | null
}
