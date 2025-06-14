import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class SignInProvidersDto {
  constructor(dto?: Partial<SignInProvidersDto>) {
    Object.assign(this, dto)
  }

  @ApiPropertyOptional({
    description: 'Override baseUrl. Useful for development',
    example: 'https://change-me.dev.nudchannel.com',
  })
  @IsString()
  @IsOptional()
  baseUrl?: string
}
