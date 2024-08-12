import { Module } from '@nestjs/common'
import { GoogleJwtClientService } from './google-jwt-client.service'
import { YouTubeService } from './youtube.service'

@Module({
  providers: [GoogleJwtClientService, YouTubeService],
  exports: [YouTubeService],
})
export class GoogleModule {}
