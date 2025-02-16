import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { RequestLocalUserDto } from './request-local-user.dto'

export class ChangeLocalUserPasswordDto extends RequestLocalUserDto {
  @ApiProperty()
  @IsString()
  currentPassword: string
}
