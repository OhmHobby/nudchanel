import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { ProfileNameDto } from './profile-name.dto'

export class UpdateProfileNameDto {
  @ApiProperty({ description: 'English name' })
  @Type(() => ProfileNameDto)
  @ValidateNested()
  @Transform(({ value }: { value: ProfileNameDto }) => (value.lang = 'en'))
  name: ProfileNameDto

  @ApiProperty()
  @Type(() => ProfileNameDto)
  @ValidateNested()
  @Transform(({ value }: { value: ProfileNameDto }) => (value.lang = 'th'))
  localName: ProfileNameDto
}
