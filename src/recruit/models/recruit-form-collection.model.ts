import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { RecruitFormCollectionEntity } from 'src/entities/recruit/recruit-form-collection.entity'
import { RecruitFormQuestionAnswerModel } from './recruit-form-question-answer.model'

export class RecruitFormCollectionModel {
  constructor(model?: Partial<RecruitFormCollectionModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  id: string

  @ApiProperty()
  title: string

  @ApiPropertyOptional()
  isCompleted?: boolean

  @ApiPropertyOptional({ type: RecruitFormQuestionAnswerModel, isArray: true })
  questions?: RecruitFormQuestionAnswerModel[]

  withIsCompleted(isCompleted?: boolean) {
    this.isCompleted = isCompleted
    return this
  }

  withQuestions(questions?: RecruitFormQuestionAnswerModel[]) {
    this.questions = questions
    return this
  }

  static fromEntity(entity: RecruitFormCollectionEntity) {
    return new RecruitFormCollectionModel({
      id: entity.id,
      title: entity.title,
    })
  }
}
