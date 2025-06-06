import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID } from 'class-validator'
import { RecruitFormAnswerEntity } from 'src/entities/recruit/recruit-form-answer.entity'
import { uuidv7 } from 'uuidv7'

export class AnswerRecruitFormQuestionDto {
  constructor(dto?: Partial<AnswerRecruitFormQuestionDto>) {
    Object.assign(this, dto)
  }

  @ApiProperty()
  @IsUUID()
  questionId: string

  @ApiProperty()
  @IsString()
  answer: string

  toEntity(applicantId: string, answerId = uuidv7()): RecruitFormAnswerEntity {
    return new RecruitFormAnswerEntity({
      id: answerId,
      applicantId,
      questionId: this.questionId,
      answer: this.answer,
    })
  }
}
