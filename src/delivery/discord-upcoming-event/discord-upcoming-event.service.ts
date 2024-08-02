import { Process, Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import dayjs from 'dayjs'
import { WebhookClient } from 'discord.js'
import { calendar_v3 } from 'googleapis'
import { ProfileService } from 'src/accounts/profile/profile.service'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { Config } from 'src/enums/config.enum'
import { GoogleCalendarService } from 'src/google/google-calendar.service'
import { DiscordEmbedEvent } from './discord-embed-event.model'
import { Saiko } from './saiko'

@Injectable()
@Processor(BullQueueName.Saiko)
export class DiscordUpcomingEventService {
  private readonly logger = new Logger(DiscordUpcomingEventService.name)

  private readonly webhookClient: WebhookClient

  constructor(
    private readonly configService: ConfigService,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly profileService: ProfileService,
  ) {
    const url = configService.get(Config.DELIVERY_UPCOMINGEVENT_DISCORDWEBHOOK)
    if (url) {
      this.webhookClient = new WebhookClient({ url })
    }
  }

  executeWebhook(content: string, embeds: DiscordEmbedEvent[], saiko = new Saiko()) {
    return this.webhookClient.send({
      username: saiko.name,
      content,
      avatarURL: saiko.avatarUrl,
      embeds: embeds.map((el) => el.setColor(saiko.color).getEmbed()),
    })
  }

  getHourAhead(hour: number): Date {
    return dayjs().add(hour, 'hours').minute(0).second(0).millisecond(0).toDate()
  }

  googleCalendarEventsToDiscordEmbedEvents(
    googleCalendarEvents: calendar_v3.Schema$Event[] = [],
  ): Promise<DiscordEmbedEvent[]> {
    return Promise.all(
      googleCalendarEvents.map(async (el) =>
        new DiscordEmbedEvent()
          .setTitle(el.summary ?? 'No title')
          .setDescription(el.description)
          .setStartTime(el.start)
          .setEndTime(el.end)
          .setLocation(el.location)
          .setAttendees(await this.profileService.discordIdsFromEmails(el.attendees?.map((a) => a.email!))),
      ),
    )
  }

  generateContent(discordEmbedEvents: DiscordEmbedEvent[] = []) {
    const message = ':calendar_spiral: **Upcoming events**'
    const discordIds = discordEmbedEvents.map((el) => el.attendeesDiscordIds).flat()
    const discordIdFormated = [...new Set(discordIds)].map((id) => `<@${id}>`).join(' ')

    if (discordIdFormated) {
      return message + '\n' + discordIdFormated
    }
    return message
  }

  @Process(BullJobName.Saiko)
  processCronJob() {
    return this.triggerWebhook()
  }

  async triggerWebhook(hourLookAhead?: number, range?: number, dryrun = false) {
    hourLookAhead = hourLookAhead ?? this.configService.getOrThrow(Config.DELIVERY_UPCOMINGEVENT_LOOKAHEADHOUR)
    range = range ?? this.configService.getOrThrow(Config.DELIVERY_UPCOMINGEVENT_RANGEHOUR)
    const from = this.getHourAhead(hourLookAhead)
    const to = this.getHourAhead(hourLookAhead + range)
    const calendarEvents = await this.googleCalendarService.list(from, to)
    const embedEvents = await this.googleCalendarEventsToDiscordEmbedEvents(calendarEvents.items)
    const content = this.generateContent(embedEvents)
    this.logger.log(`${embedEvents.length} events from ${from.toISOString()} to ${to.toISOString()}`)
    if (embedEvents.length && !dryrun) {
      await this.executeWebhook(content, embedEvents, new Saiko())
    }
    return embedEvents
  }
}
