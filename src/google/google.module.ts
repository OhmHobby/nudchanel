import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { Module } from '@nestjs/common'
import { GoogleCredentialModel } from 'src/models/google-credential.model'
import { GoogleCalendarService } from './google-calendar.service'
import { GoogleJwtClientService } from './google-jwt-client.service'
import { GoogleOauth2ClientService } from './google-oauth2-client.service'
import { YouTubeService } from './youtube.service'

@Module({
  imports: [TypegooseModule.forFeature([GoogleCredentialModel])],
  providers: [GoogleOauth2ClientService, GoogleJwtClientService, GoogleCalendarService, YouTubeService],
  exports: [GoogleCalendarService, YouTubeService],
})
export class GoogleModule {}
