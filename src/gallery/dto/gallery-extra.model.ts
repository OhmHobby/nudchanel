import { ApiProperty } from '@nestjs/swagger'
import { GalleryPhotoFlowState } from 'src/enums/gallery-photo-flow-state.enum'

export class GalleryExtraModel {
  @ApiProperty({ enum: GalleryPhotoFlowState, enumName: 'GalleryPhotoFlowState' })
  galleryPhotoFlowState: GalleryPhotoFlowState
}
