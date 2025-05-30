import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { RegistrationTokenModel } from 'src/models/accounts/registration-token.model'

export class AccountRegistrationInfoModel {
  constructor(model?: Partial<AccountRegistrationInfoModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  id: string

  @ApiPropertyOptional()
  email?: string

  static fromModel(model: RegistrationTokenModel): AccountRegistrationInfoModel {
    return new AccountRegistrationInfoModel({
      id: model._id,
      email: model.profile?.emails?.at(0),
    })
  }
}
