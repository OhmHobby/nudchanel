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
@Processor(BullQueueName.DiscordEventsNotifier)
export class DiscortEventsNotifierService {
  private readonly logger = new Logger(DiscortEventsNotifierService.name)

  private readonly webhookClient: WebhookClient

  constructor(
    private readonly configService: ConfigService,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly profileService: ProfileService,
  ) {
    const url = configService.get(Config.DELIVERY_UPCOMINGEVENTS_DISCORDWEBHOOK)
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

  floorInterval(intervalMinute: number, now = new Date()) {
    return dayjs(now)
      .minute(Math.floor(now.getMinutes() / intervalMinute) * intervalMinute)
      .second(0)
      .millisecond(0)
      .toDate()
  }

  ceilInterval(intervalMinute: number, now = new Date()) {
    const floor = this.floorInterval(intervalMinute, now)
    return dayjs(floor).add(intervalMinute, 'minutes').subtract(1, 'second').toDate()
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

  generateContent(message: string, discordEmbedEvents: DiscordEmbedEvent[] = []) {
    const discordIds = discordEmbedEvents.map((el) => el.attendeesDiscordIds).flat()
    const discordIdFormated = [...new Set(discordIds)].map((id) => `<@${id}>`).join(' ')

    if (discordIdFormated) {
      return message + '\n' + discordIdFormated
    }
    return message
  }

  @Process(BullJobName.DiscordUpcomingEvents)
  processUpcomingCronJob() {
    const hourLookAhead = this.configService.getOrThrow(Config.DELIVERY_UPCOMINGEVENTS_LOOKAHEADHOURS)
    const range = this.configService.getOrThrow(Config.DELIVERY_UPCOMINGEVENTS_RANGEHOURS)
    return this.triggerUpcoming(hourLookAhead, range)
  }

  @Process(BullJobName.DiscordStartingEvents)
  processStartingCronJob() {
    return this.triggerStaring()
  }

  triggerUpcoming(hourLookAhead: number, range: number, dryrun = false) {
    const message = ':calendar_spiral: **Upcoming events**'
    return this.triggerWebhook(
      this.getHourAhead(hourLookAhead),
      this.getHourAhead(hourLookAhead + range),
      message,
      dryrun,
    )
  }

  triggerStaring(now = new Date(), dryrun = false) {
    const message = ':loudspeaker: *This event is starting now*'
    const interval = this.configService.getOrThrow<number>(Config.DELIVERY_STARTINGEVENTS_RANGEMINUTES)
    const from = this.floorInterval(interval, now)
    const to = this.ceilInterval(interval, now)
    return this.triggerWebhook(from, to, message, dryrun)
  }

  private async triggerWebhook(from: Date, to: Date, message: string, dryrun = false) {
    const calendarEvents = await this.googleCalendarService.list(from, to)
    const withoutInterviewEvents = calendarEvents.items?.filter(
      // Temporary solution
      (el) => !el.summary?.toLocaleLowerCase().includes('interview invitation'),
    )
    const upcomingEvents = this.googleCalendarService.filterOnlyUpcomingEvents(from, withoutInterviewEvents)
    const embedEvents = await this.googleCalendarEventsToDiscordEmbedEvents(upcomingEvents)
    const content = this.generateContent(message, embedEvents)
    this.logger.log(`${embedEvents.length} events from ${from.toISOString()} to ${to.toISOString()}`)
    if (embedEvents.length && !dryrun) {
      await this.executeWebhook(content, embedEvents, new Saiko())
    }
    return embedEvents
  }
}
