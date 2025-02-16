import { ApiProperty } from '@nestjs/swagger'

export class LocalUserModel {
  constructor(model?: Partial<LocalUserModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  username: string
}
