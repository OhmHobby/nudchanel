import { Body, Controller, Post } from '@nestjs/common'
import { ApiCreatedResponse } from '@nestjs/swagger'
import { GalleryReportModel } from '../dto/gallery-report.model'
import { GalleryReportDto } from '../dto/gallery-report.dto'
import { GalleryReportService } from './gallery-report.service'

@Controller({
  version: '1',
  path: 'gallery/reports',
})
export class GalleryReportController {
  constructor(private readonly galleryReportService: GalleryReportService) {}

  @Post()
  @ApiCreatedResponse({ type: () => GalleryReportModel })
  createReport(@Body() doc: GalleryReportDto) {
    return this.galleryReportService.createReport(doc.reason, doc.photoId, doc.albumId, null, doc.email)
  }
}
