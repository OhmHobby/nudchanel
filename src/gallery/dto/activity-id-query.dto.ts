import { ApiProperty } from '@nestjs/swagger'
import { GalleryQueryDto } from './gallery-query.dto'

export class ActivityIdQueryDto extends GalleryQueryDto {
  @ApiProperty({ type: 'string' })
  activityId: string
}
