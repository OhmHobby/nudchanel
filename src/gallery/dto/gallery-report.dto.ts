import { ApiProperty } from '@nestjs/swagger'

export class GalleryReportDto {
  constructor(base: Partial<GalleryReportDto>) {
    Object.assign(this, base)
  }

  @ApiProperty()
  title: string

  @ApiProperty()
  description: string

  @ApiProperty()
  photoId: string
}
