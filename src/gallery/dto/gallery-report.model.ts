import { ApiProperty } from '@nestjs/swagger'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { GalleryReportEntity } from 'src/entities/gallery/gallery-report.entity'
import { GalleryReportState } from 'src/enums/gallery-report-state.enum'
import { SaveOptions, RemoveOptions } from 'typeorm'

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
