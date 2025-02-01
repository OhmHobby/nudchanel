import { ApiProperty } from '@nestjs/swagger'

export class GalleryAlbumPhotoUploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File
}
