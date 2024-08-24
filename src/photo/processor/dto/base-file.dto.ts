import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class FileDto {
  @ApiProperty({
    description:
      'Absolute path for WebDAV or ObjectName for MinIO\n' +
      'Add `webdav://` or `minio://` in front of path to specify backend storage',
    example: 'webdav://2022/[2022.01.31] Test/Photos/JPEG/IMG_0000.JPG',
  })
  @IsString()
  path: string
}
