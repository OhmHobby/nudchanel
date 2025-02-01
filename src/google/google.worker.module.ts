import { Module } from '@nestjs/common'
import { GoogleCalendarService } from './google-calendar.service'
import { GoogleOauth2ClientService } from './google-oauth2-client.service'

@Module({
  providers: [GoogleOauth2ClientService, GoogleCalendarService],
  exports: [GoogleCalendarService],
})
export class GoogleWorkerModule {}
