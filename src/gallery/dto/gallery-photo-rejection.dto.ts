import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { GalleryPhotoRejectReason } from 'src/enums/gallery-photo-reject-reason.enum'

export class GalleryPhotoRejectionDto {
  @ApiProperty({ enum: GalleryPhotoRejectReason })
  @IsEnum(GalleryPhotoRejectReason)
  reason: GalleryPhotoRejectReason

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  message?: string
}
