import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { ProfileNameDto } from './profile-name.dto'

export class UpdateProfileNameDto {
  @ApiProperty({ description: 'English name' })
  @Type(() => ProfileNameDto)
  @ValidateNested()
  @Transform(({ value }: { value: ProfileNameDto }) => {
    if (value && typeof value === 'object') {
      value.lang = 'en'
    }
    return value
  })
  name: ProfileNameDto

  @ApiProperty()
  @Type(() => ProfileNameDto)
  @ValidateNested()
  @Transform(({ value }: { value: ProfileNameDto }) => {
    if (value && typeof value === 'object') {
      value.lang = 'th'
    }
    return value
  })
  localName: ProfileNameDto
}
