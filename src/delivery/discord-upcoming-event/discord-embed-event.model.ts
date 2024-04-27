const DEFAULT_COLOR = 16088076
import { calendar_v3 } from 'googleapis'

type EmbedField = { name: string; value: string; inline: boolean }

export class DiscordEmbedEvent {
  title: string

  description = ''

  eventStartAt: Date

  eventEndAt: Date

  color: number = DEFAULT_COLOR

  location = ''

  attendeesDiscordIds: string[] = []

  private milliToSecond(timestamp: number) {
    const milliInSecond = 1000
    return Math.floor(timestamp / milliInSecond)
  }

  get eventStartAtTimestampSecond(): number {
    return this.milliToSecond(this.eventStartAt.getTime())
  }

  get eventEndAtTimestampSecond(): number {
    return this.milliToSecond(this.eventEndAt.getTime())
  }

  get attendeesFormatted(): string {
    return this.attendeesDiscordIds.map((id) => `<@${id}>`).join(' ')
  }

  setTitle(title: string) {
    this.title = title
    return this
  }

  setDescription(description?: string | null) {
    this.description = description ?? ''
    return this
  }

  setStartTime(start?: calendar_v3.Schema$EventDateTime) {
    const dateTime = start?.dateTime ?? start?.date
    this.eventStartAt = dateTime ? new Date(dateTime) : this.eventStartAt
    return this
  }

  setEndTime(end?: calendar_v3.Schema$EventDateTime) {
    const dateTime = end?.dateTime ?? end?.date
    this.eventEndAt = dateTime ? new Date(dateTime) : this.eventEndAt
    return this
  }

  setLocation(location?: string | null) {
    this.location = location ?? ''
    return this
  }

  setColor(color: number) {
    this.color = color
    return this
  }

  setAttendees(discordIds: string[]) {
    this.attendeesDiscordIds = discordIds.filter((el) => el)
    return this
  }

  private fields(): EmbedField[] {
    const fields = [
      {
        name: 'When',
        value: `<t:${this.eventStartAtTimestampSecond}:f> - <t:${this.eventEndAtTimestampSecond}:t> (<t:${this.eventStartAtTimestampSecond}:R>)`,
        inline: true,
      },
    ]
    if (this.location) {
      fields.push({
        name: 'Where',
        value: this.location,
        inline: true,
      })
    }
    if (this.attendeesDiscordIds.length) {
      fields.push({
        name: 'Attendees',
        value: this.attendeesFormatted,
        inline: false,
      })
    }
    return fields
  }

  getEmbed() {
    return {
      title: this.title,
      description: this.description ?? '',
      color: this.color,
      fields: this.fields(),
    }
  }
}
