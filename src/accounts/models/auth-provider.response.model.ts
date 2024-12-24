import { ApiProperty } from '@nestjs/swagger'
import { OidcProvider } from 'src/enums/oidc-provider.enum'

export class AuthProviderResponseModel {
  constructor(model?: Partial<AuthProviderResponseModel>) {
    Object.assign(this, model)
  }

  @ApiProperty({ enum: OidcProvider })
  provider: string

  @ApiProperty()
  url: string
}
