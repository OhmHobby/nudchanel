import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { GalleryPhotoState } from 'src/enums/gallery-photo-state.enum'
import { transformProfileObjectId } from 'src/helpers/transform-profile-object-id'
import { ProfileId } from 'src/models/types'

export class GalleryUploadPhotosQueryDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(transformProfileObjectId)
  takenBy?: ProfileId

  @ApiPropertyOptional({ enum: GalleryPhotoState })
  @IsOptional()
  state?: GalleryPhotoState
}
