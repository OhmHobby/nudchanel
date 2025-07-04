import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsString, Matches, IsUUID } from 'class-validator'

export class RemoveRecruitInterviewSlotDto {
  @ApiProperty()
  @IsString()
  @Matches(/^[a-z0-9]+\-[a-z0-9]+$/, { message: 'Invalid refId' })
  refId: string

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID(undefined, { each: true })
  roleIds: string[]
}
