import { BadRequestException, Body, Controller, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiCreatedResponse } from '@nestjs/swagger'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { GalleryReportModel } from '../dto/gallery-report.model'
import { GalleryReportDto } from '../dto/gallery-report.dto'
import { UserCtx } from 'src/auth/user.decorator'
import { User } from '@nudchannel/auth'
import { GalleryReportService } from './gallery-report.service'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'

@Controller({
  version: '1',
  path: 'gallery/reports',
})
export class GalleryReportController {
  constructor(private readonly galleryReportService: GalleryReportService) {}

  @Post()
  @AuthGroups()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiCreatedResponse({ type: () => GalleryReportModel })
  createReport(@Body() doc: GalleryReportDto, @UserCtx() user: User) {
    const userUUID = ObjectIdUuidConverter.toUuid(user.id)
    if (!userUUID) {
      throw new BadRequestException('User not found or invalid')
    }
    return this.galleryReportService.createReport(doc.title, doc.description, doc.photoId, userUUID)
  }
}
