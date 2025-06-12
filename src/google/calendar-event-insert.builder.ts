import { calendar_v3 } from 'googleapis'
import { v4 as uuidv4 } from 'uuid'

export class CalendarEventInsertBuilder {
  private params: calendar_v3.Params$Resource$Events$Insert = {
    calendarId: 'primary',
    sendUpdates: 'all',
    requestBody: {},
  }

  setCalendarId(calendarId: string): this {
    this.params.calendarId = calendarId
    return this
  }

  setSendUpdates(sendUpdates: 'all' | 'externalOnly' | 'none'): this {
    this.params.sendUpdates = sendUpdates
    return this
  }

  setTimeRange(from: Date, to: Date): this {
    this.params.requestBody!.start = { dateTime: from.toISOString() }
    this.params.requestBody!.end = { dateTime: to.toISOString() }
    return this
  }

  setTitle(title: string): this {
    this.params.requestBody!.summary = title
    return this
  }

  setDescription(description: string): this {
    this.params.requestBody!.description = description
    return this
  }

  setAttendees(attendees: string[]): this {
    this.params.requestBody!.attendees = attendees.map((email) => ({ email }))
    return this
  }

  withConferenceData(requestId?: string): this {
    this.params.conferenceDataVersion = 1
    this.params.requestBody!.conferenceData = {
      createRequest: {
        requestId: requestId || uuidv4(),
      },
    }
    return this
  }

  build(): calendar_v3.Params$Resource$Events$Insert {
    return this.params
  }
}
