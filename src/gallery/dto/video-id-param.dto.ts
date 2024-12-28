import { ApiProperty } from '@nestjs/swagger'

export class VideoIdParamDto {
  @ApiProperty({ type: String })
  videoId: string
}
