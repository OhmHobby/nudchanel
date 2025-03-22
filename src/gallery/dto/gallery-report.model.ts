import { ApiProperty } from '@nestjs/swagger'
import { GalleryReportState } from 'src/enums/gallery-report-state.enum'

export class GalleryReportModel {
  @ApiProperty()
  id: string

  @ApiProperty()
  reason: string

  @ApiProperty()
  albumId: string

  @ApiProperty()
  photoId: string

  @ApiProperty({
    enum: GalleryReportState,
  })
  state: GalleryReportState

  @ApiProperty({
    type: String,
    nullable: true,
  })
  reportById: string | null

  @ApiProperty({
    type: String,
    nullable: true,
  })
  email: string | null
}
