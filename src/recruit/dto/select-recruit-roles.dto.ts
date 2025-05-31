import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsUUID } from 'class-validator'

export class SelectRecruitRolesDto {
  @ApiProperty()
  @IsUUID(undefined, { each: true })
  @IsArray()
  roleIds: string[]
}
