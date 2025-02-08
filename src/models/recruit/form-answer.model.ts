import { modelOptions, prop, Ref } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { ApplicantModel } from './applicant.model'
import { FormQuestionModel } from './form-questions.model'

@modelOptions({ schemaOptions: { collection: 'form.answers' } })
export class FormAnswerModel {
  @prop({ auto: true })
  _id: Types.ObjectId

  @prop({ required: true, ref: () => ApplicantModel })
  applicant: Ref<ApplicantModel>

  @prop({ required: true, ref: () => FormQuestionModel })
  question: Ref<FormQuestionModel>

  @prop({ required: true })
  answer: string
}
