import { Module } from '@nestjs/common'
import { GoogleCalendarService } from './google-calendar.service'
import { GoogleJwtClientService } from './google-jwt-client.service'
import { GoogleOauth2ClientService } from './google-oauth2-client.service'
import { YouTubeService } from './youtube.service'

@Module({
  providers: [GoogleJwtClientService, YouTubeService, GoogleCalendarService, GoogleOauth2ClientService],
  exports: [YouTubeService, GoogleCalendarService],
})
export class GoogleModule {}
