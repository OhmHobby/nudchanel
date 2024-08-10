import { BadRequestException } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { Types } from 'mongoose'

export class ProfileIdDto {
  @ApiProperty({ type: String })
  @Transform(({ value }) => {
    try {
      return new Types.ObjectId(value as string)
    } catch (err) {
      throw new BadRequestException('ProfileId must be an ObjectId')
    }
  })
  profileId: Types.ObjectId
}
