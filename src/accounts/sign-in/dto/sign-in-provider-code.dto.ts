import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class SignInProviderCodeDto {
  constructor(dto?: Partial<SignInProviderCodeDto>) {
    Object.assign(this, dto)
  }

  @ApiProperty({ description: 'Sign-in code' })
  @IsString()
  code: string

  @ApiPropertyOptional({
    description: 'Override baseUrl. Useful for development',
    example: 'https://change-me.dev.nudchannel.com',
  })
  @IsString()
  @IsOptional()
  baseUrl?: string
}
