import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEnum, IsOptional } from 'class-validator'
import { GalleryPhotoNextState } from 'src/enums/gallery-photo-pending-state.enum'
import { GalleryPhotoState } from 'src/enums/gallery-photo-state.enum'
import { transformProfileObjectId } from 'src/helpers/transform-profile-object-id'
import { ProfileId } from 'src/models/types'

export class GalleryUploadPhotosQueryDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(transformProfileObjectId)
  takenBy?: ProfileId

  @ApiPropertyOptional({ enum: GalleryPhotoState })
  @IsEnum(GalleryPhotoState)
  @IsOptional()
  state?: GalleryPhotoState

  @ApiPropertyOptional({ enum: GalleryPhotoNextState })
  @IsEnum(GalleryPhotoNextState)
  @IsOptional()
  nextState?: GalleryPhotoNextState
}
