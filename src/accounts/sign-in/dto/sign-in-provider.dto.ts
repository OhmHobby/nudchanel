import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { OidcProvider } from 'src/enums/oidc-provider.enum'

export class SignInProviderDto {
  constructor(dto?: Partial<SignInProviderDto>) {
    Object.assign(this, dto)
  }

  @ApiProperty({ enum: OidcProvider })
  @IsEnum(OidcProvider)
  provider: OidcProvider

  @ApiPropertyOptional({
    description: 'Override baseUrl. Useful for development',
    example: 'https://change-me.dev.nudchannel.com',
  })
  @IsString()
  @IsOptional()
  baseUrl?: string
}
