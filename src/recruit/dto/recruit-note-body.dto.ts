import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { RecruitNoteEntity } from 'src/entities/recruit/recruit-note.entity'

export class RecruitNoteBodyDto {
  @ApiProperty()
  @IsString()
  note: string

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  onlyMe?: boolean

  toCreateEntity(applicantId: string, createdBy: string): RecruitNoteEntity {
    return new RecruitNoteEntity({
      applicantId,
      note: this.note,
      onlyMe: this.onlyMe ?? false,
      createdBy,
    })
  }

  toEditEntity(): Partial<RecruitNoteEntity> {
    return {
      note: this.note,
      onlyMe: this.onlyMe,
    }
  }
}
