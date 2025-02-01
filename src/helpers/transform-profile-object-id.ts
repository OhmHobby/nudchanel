import { BadRequestException } from '@nestjs/common'
import { Types } from 'mongoose'

export const transformProfileObjectId = ({ value }) => {
  try {
    return new Types.ObjectId(value as string)
  } catch (err) {
    throw new BadRequestException('ProfileId must be an ObjectId')
  }
}
