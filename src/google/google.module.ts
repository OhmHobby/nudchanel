import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { Module } from '@nestjs/common'
import { GoogleCredentialModel } from 'src/models/google-credential.model'
import { GoogleService } from './google.service'
import { GoogleCalendarService } from './google-calendar.service'

@Module({
  imports: [TypegooseModule.forFeature([GoogleCredentialModel])],
  providers: [GoogleService, GoogleCalendarService],
  exports: [GoogleCalendarService],
})
export class GoogleModule {}
