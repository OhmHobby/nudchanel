import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { Validate } from 'class-validator'
import { transformProfileObjectId } from 'src/helpers/transform-profile-object-id'
import { ProfileId } from 'src/models/types'
import { ValidPath } from 'src/validators/valid-path'

export class GalleryAlbumPhotoImportDto {
  @ApiProperty()
  @Validate(ValidPath, [/^\/\d{4}\/.+/])
  directory: string

  @ApiProperty({ type: String })
  @Transform(transformProfileObjectId)
  takenBy: ProfileId
}
