import { BadRequestException } from '@nestjs/common'
import { ProfileIdModel } from 'src/accounts/models/profile-id.model'

export const transformProfileIdModel = ({ value }): ProfileIdModel => {
  try {
    return ProfileIdModel.fromObjectIdOrThrow(value)
  } catch (err) {
    throw new BadRequestException('ProfileId must be an ObjectId')
  }
}
