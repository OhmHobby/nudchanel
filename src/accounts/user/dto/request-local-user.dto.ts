import { ApiProperty } from '@nestjs/swagger'
import { IsStrongPassword, Validate } from 'class-validator'
import { STRONG_PASSWORD_OPTIONS } from 'src/constants/account.constant'
import { IsNonCommonPasswordConstraint } from '../non-password-password.constraint'
import { PasswordStrengthConstraint } from '../zxcvbn.constraint'

export class RequestLocalUserDto {
  @ApiProperty()
  @IsStrongPassword(STRONG_PASSWORD_OPTIONS)
  @Validate(PasswordStrengthConstraint)
  @Validate(IsNonCommonPasswordConstraint)
  newPassword: string
}
