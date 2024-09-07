import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class SignInProviderCodeDto {
  constructor(dto?: Partial<SignInProviderCodeDto>) {
    Object.assign(this, dto)
  }

  @ApiProperty({ description: 'Sign-in code' })
  @IsString()
  code: string
}
