import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEnum, IsIn, IsUUID } from 'class-validator'
import { DEFAULT_UUID } from 'src/constants/uuid.constants'
import { PhotoSize } from 'src/enums/photo-size.enum'

export class GetPhotoDto {
  @ApiProperty({
    enum: Object.keys(PhotoSize).filter((el) => isNaN(Number(el))),
    example: PhotoSize[PhotoSize.preview],
  })
  @IsEnum(PhotoSize, { message: 'Unknown size' })
  @Transform(({ value }) => PhotoSize[value])
  size: PhotoSize

  @IsUUID()
  @ApiProperty({ example: DEFAULT_UUID })
  uuid: string

  @ApiProperty({ example: 'webp' })
  @IsIn(['jpg', 'webp'])
  ext: string
}
