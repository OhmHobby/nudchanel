import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString, IsStrongPassword, Validate } from 'class-validator'
import { IsNonCommonPasswordConstraint } from 'src/accounts/user/non-password-password.constraint'
import { PasswordStrengthConstraint } from 'src/accounts/user/zxcvbn.constraint'
import { STRONG_PASSWORD_OPTIONS } from 'src/constants/account.constant'

export class SignInLocalUserRequestDto {
  @ApiProperty({ type: String })
  @IsString()
  username: string

  @ApiProperty({ type: String })
  @IsStrongPassword(STRONG_PASSWORD_OPTIONS)
  @Validate(PasswordStrengthConstraint)
  @Validate(IsNonCommonPasswordConstraint)
  password: string

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  persistent?: boolean
}
