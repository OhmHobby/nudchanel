import { ApiProperty } from '@nestjs/swagger'
import { GalleryReportState } from 'src/enums/gallery-report-state.enum'

export class GalleryReportModel {
  @ApiProperty()
  id: number

  @ApiProperty()
  title: string

  @ApiProperty()
  description: string

  @ApiProperty()
  photoId: string

  @ApiProperty({ type: String, enum: GalleryReportState })
  state: GalleryReportState

  @ApiProperty()
  reportById: string
}
