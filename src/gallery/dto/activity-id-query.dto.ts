import { ApiProperty } from '@nestjs/swagger'
import { GalleryQueryDto } from './gallery-query.dto'
import { IsString } from 'class-validator'

export class ActivityIdQueryDto extends GalleryQueryDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  activityId: string
}
