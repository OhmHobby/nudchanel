import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'
import { UuidParamDto } from 'src/gallery/dto/uuid-param.dto'

export class RecruitNoteParamDto extends UuidParamDto {
  @ApiProperty()
  @IsUUID()
  noteId: string
}
