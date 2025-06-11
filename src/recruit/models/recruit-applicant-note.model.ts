import { ApiProperty } from '@nestjs/swagger'
import { RecruitNoteEntity } from 'src/entities/recruit/recruit-note.entity'

export class RecruitApplicantNoteModel {
  constructor(model?: Partial<RecruitApplicantNoteModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  id: string

  @ApiProperty()
  note: string

  @ApiProperty()
  onlyMe: boolean

  @ApiProperty()
  isFromMe: boolean

  static fromEntity(entity: RecruitNoteEntity, myProfileUid?: string) {
    return new RecruitApplicantNoteModel({
      id: entity.id,
      note: entity.note,
      onlyMe: entity.onlyMe,
      isFromMe: entity.createdBy === myProfileUid,
    })
  }
}
