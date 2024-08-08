import { ApiProperty } from '@nestjs/swagger'

export class AlbumIdDto {
  @ApiProperty({ type: 'string' })
  albumId: string
}
