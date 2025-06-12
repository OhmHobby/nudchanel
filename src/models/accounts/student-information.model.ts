import { modelOptions, Prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { StudentProfileModel } from './student-profile.model'

@modelOptions({ schemaOptions: { collection: 'students.information' } })
export class StudentInformationModel {
  @Prop({ auto: true })
  _id: Types.ObjectId

  @Prop({ ref: StudentProfileModel, alias: 'studentId' })
  student_id: string

  studentId?: string

  @Prop()
  year: number

  @Prop()
  level: number

  @Prop({ required: false })
  room?: number

  @Prop({ required: false })
  number?: number
}
