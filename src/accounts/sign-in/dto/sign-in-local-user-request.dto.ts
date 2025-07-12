import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString, Validate } from 'class-validator'
import { IsNonCommonPasswordConstraint } from 'src/accounts/user/non-password-password.constraint'
import { PasswordCharacterConstraint } from 'src/accounts/user/password-character.constraint'
import { PasswordStrengthConstraint } from 'src/accounts/user/password-strength.constraint'

export class SignInLocalUserRequestDto {
  @ApiProperty({ type: String })
  @IsString()
  username: string

  @ApiProperty({ type: String })
  @Validate(PasswordCharacterConstraint)
  @Validate(PasswordStrengthConstraint)
  @Validate(IsNonCommonPasswordConstraint)
  password: string

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  persistent?: boolean
}
