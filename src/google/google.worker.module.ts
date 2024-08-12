import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { Module } from '@nestjs/common'
import { GoogleCredentialModel } from 'src/models/google-credential.model'
import { GoogleCalendarService } from './google-calendar.service'
import { GoogleOauth2ClientService } from './google-oauth2-client.service'

@Module({
  imports: [TypegooseModule.forFeature([GoogleCredentialModel])],
  providers: [GoogleOauth2ClientService, GoogleCalendarService],
  exports: [GoogleCalendarService],
})
export class GoogleWorkerModule {}
