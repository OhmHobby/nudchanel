import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { RecruitFormQuestionEntity } from 'src/entities/recruit/recruit-form-question.entity'

export class RecruitFormQuestionModel {
  constructor(model?: Partial<RecruitFormQuestionModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  id: string

  @ApiProperty()
  collectionId: string

  @ApiProperty()
  question: string

  @ApiProperty()
  input: string

  @ApiPropertyOptional({ type: String, isArray: true, nullable: true })
  options?: string[] | null

  @ApiProperty()
  rank: number

  static fromEntity(entity: RecruitFormQuestionEntity) {
    return new RecruitFormQuestionModel({
      id: entity.id,
      collectionId: entity.collectionId ?? '',
      question: entity.question,
      input: entity.input,
      options: entity.options,
      rank: entity.rank,
    })
  }
}
