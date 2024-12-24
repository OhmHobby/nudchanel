import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { OidcProvider } from 'src/enums/oidc-provider.enum'

export class SignInProviderDto {
  constructor(dto?: Partial<SignInProviderDto>) {
    Object.assign(this, dto)
  }

  @ApiProperty({ enum: OidcProvider })
  @IsEnum(OidcProvider)
  provider: OidcProvider
}
