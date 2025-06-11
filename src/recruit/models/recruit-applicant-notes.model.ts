import { ApiProperty } from '@nestjs/swagger'
import { RecruitNoteEntity } from 'src/entities/recruit/recruit-note.entity'
import { RecruitApplicantNoteModel } from './recruit-applicant-note.model'

export class RecruitApplicantNotesModel {
  constructor(model?: Partial<RecruitApplicantNotesModel>) {
    Object.assign(this, model)
  }

  @ApiProperty({ type: RecruitApplicantNoteModel, isArray: true })
  notes: RecruitApplicantNoteModel[]

  static fromEntities(entities: RecruitNoteEntity[], myProfileUid?: string) {
    return new RecruitApplicantNotesModel({
      notes: entities.map((el) => RecruitApplicantNoteModel.fromEntity(el, myProfileUid)),
    })
  }
}
