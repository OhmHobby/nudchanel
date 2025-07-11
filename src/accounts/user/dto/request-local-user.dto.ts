import { ApiProperty } from '@nestjs/swagger'
import { IsStrongPassword, Validate } from 'class-validator'
import { STRONG_PASSWORD_OPTIONS } from 'src/constants/account.constant'
import { IsNonCommonPasswordConstraint } from '../non-password-password.constraint'

export class RequestLocalUserDto {
  @ApiProperty()
  @IsStrongPassword(STRONG_PASSWORD_OPTIONS, { message: 'Password is not strong enough' })
  @Validate(IsNonCommonPasswordConstraint)
  newPassword: string
}
