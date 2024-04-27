import { Injectable } from '@nestjs/common'
import { calendar_v3, google } from 'googleapis'
import { GoogleService } from 'src/google/google.service'

@Injectable()
export class GoogleCalendarService {
  private readonly calendarId = 'primary'

  constructor(private readonly googleService: GoogleService) {}

  async getCalendar() {
    const client = await this.googleService.getClientWithCredential()
    return google.calendar({
      version: 'v3',
      auth: client,
    })
  }

  async list(from?: Date, to?: Date): Promise<calendar_v3.Schema$Events> {
    const { events } = await this.getCalendar()
    const { data } = await events.list({
      calendarId: this.calendarId,
      timeMin: from?.toISOString(),
      timeMax: to?.toISOString(),
      orderBy: 'startTime',
      singleEvents: true,
    })
    return data
  }

  async find(from?: Date, to?: Date, email?: string, summary?: string) {
    const events = await this.list(from, to)
    return events.items?.filter(
      (event) =>
        (!summary || event.summary === summary) &&
        (!email || event?.attendees?.some((attendee) => attendee.email === email)),
    )
  }
}
