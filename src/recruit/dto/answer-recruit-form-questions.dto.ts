import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { AnswerRecruitFormQuestionDto } from './answer-recruit-form-question.dto'

export class AnswerRecruitFormQuestionsDto {
  @ApiProperty({ type: AnswerRecruitFormQuestionDto, isArray: true })
  @Type(() => AnswerRecruitFormQuestionDto)
  @ValidateNested()
  items: AnswerRecruitFormQuestionDto[]
}
