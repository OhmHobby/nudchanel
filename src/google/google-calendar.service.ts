import { Injectable } from '@nestjs/common'
import { calendar_v3, google } from 'googleapis'
import { GoogleOauth2ClientService } from 'src/google/google-oauth2-client.service'
import { CalendarEventInsertBuilder } from './calendar-event-insert.builder'

@Injectable()
export class GoogleCalendarService {
  protected readonly SCOPES = ['https://www.googleapis.com/auth/calendar']

  private readonly calendarId = 'primary'

  constructor(private readonly googleService: GoogleOauth2ClientService) {}

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
      timeZone: process.env.TZ,
    })
    return data
  }

  filterOnlyUpcomingEvents(
    from: Date = new Date(),
    items: calendar_v3.Schema$Event[] = [],
  ): calendar_v3.Schema$Event[] {
    return items?.filter((item) => new Date(item.start?.dateTime ?? '0').getTime() >= from.getTime())
  }

  async find(from?: Date, to?: Date, email?: string, summary?: string) {
    const events = await this.list(from, to)
    return events.items?.filter(
      (event) =>
        (!summary || event.summary === summary) &&
        (!email || event?.attendees?.some((attendee) => attendee.email === email)),
    )
  }

  async create(
    from: Date,
    to: Date,
    title: string,
    description: string,
    attendees: string[],
    createWithMeet = false,
  ): Promise<calendar_v3.Schema$Event> {
    const { events } = await this.getCalendar()
    const builder = this.createEventInsertBuilder()
      .setTimeRange(from, to)
      .setTitle(title)
      .setDescription(description)
      .setAttendees(attendees)
    if (createWithMeet) {
      builder.withConferenceData()
    }
    const insertParams = builder.build()

    const response = await events.insert(insertParams)
    return response.data
  }

  async remove(eventId: string, sendUpdates: 'all' | 'externalOnly' | 'none' = 'all'): Promise<void> {
    const { events } = await this.getCalendar()
    await events.delete({
      calendarId: this.calendarId,
      eventId,
      sendUpdates,
    })
  }

  generateAuthUrl(): string {
    return this.googleService.createClient().generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
    })
  }

  private createEventInsertBuilder(): CalendarEventInsertBuilder {
    return new CalendarEventInsertBuilder().setCalendarId(this.calendarId)
  }
}
