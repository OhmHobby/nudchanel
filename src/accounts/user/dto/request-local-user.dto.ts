import { ApiProperty } from '@nestjs/swagger'
import { Validate } from 'class-validator'
import { IsPwnedPasswordConstraint } from '../is-pwned-password.constraint'
import { IsNonCommonPasswordConstraint } from '../non-password-password.constraint'
import { PasswordCharacterConstraint } from '../password-character.constraint'
import { PasswordStrengthConstraint } from '../password-strength.constraint'

export class RequestLocalUserDto {
  @ApiProperty()
  @Validate(PasswordCharacterConstraint)
  @Validate(PasswordStrengthConstraint)
  @Validate(IsNonCommonPasswordConstraint)
  @Validate(IsPwnedPasswordConstraint)
  newPassword: string
}
