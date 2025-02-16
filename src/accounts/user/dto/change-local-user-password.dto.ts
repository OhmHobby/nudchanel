import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsStrongPassword, Validate } from 'class-validator'
import { IsNonCommonPasswordConstraint } from '../non-password-password.constraint'

export class ChangeLocalUserPasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string

  @ApiProperty()
  @IsStrongPassword(
    { minLength: 8, minLowercase: 0, minUppercase: 0, minNumbers: 0, minSymbols: 0 },
    { message: 'Password is not strong enough' },
  )
  @Validate(IsNonCommonPasswordConstraint)
  newPassword: string
}
