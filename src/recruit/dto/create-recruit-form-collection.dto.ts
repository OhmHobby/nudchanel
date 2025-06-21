import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID } from 'class-validator'

export class CreateRecruitFormCollectionDto {
  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty()
  @IsUUID()
  recruitId: string
}
