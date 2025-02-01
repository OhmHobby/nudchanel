import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { transformProfileObjectId } from 'src/helpers/transform-profile-object-id'
import { ProfileId } from 'src/models/types'

export class GalleryUploadPhotosQueryDto {
  @ApiPropertyOptional({ description: 'Upload/Import by' })
  @IsOptional()
  @Transform(transformProfileObjectId)
  profileId?: ProfileId
}
