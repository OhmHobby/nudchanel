import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { ProfileService } from 'src/accounts/profile/profile.service'
import { GoogleCalendarService } from 'src/google/google-calendar.service'
import { DiscordEmbedEvent } from './discord-embed-event.model'
import { DiscortEventsNotifierService } from './discord-events-notifier.service'

jest.mock('@nestjs/config')
jest.mock('src/google/google-calendar.service')
jest.mock('src/accounts/profile/profile.service')

describe(DiscortEventsNotifierService.name, () => {
  let service: DiscortEventsNotifierService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscortEventsNotifierService, ConfigService, GoogleCalendarService, ProfileService],
    }).compile()

    service = module.get(DiscortEventsNotifierService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(DiscortEventsNotifierService.prototype.getHourAhead.name, () => {
    it('should return date correctly', () => {
      const now = new Date()
      const result = service.getHourAhead(24)
      if (result.getMonth() === now.getMonth()) {
        expect(result.getDate()).toBe(now.getDate() + 1)
      } else {
        expect(result.getDate()).toBe(1)
      }
      expect(result.getHours()).toBe(now.getHours())
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
    })
  })

  describe(DiscortEventsNotifierService.prototype.floorInterval.name, () => {
    it('should return date correctly', () => {
      const now = new Date(2024, 0, 1, 21, 0, 2, 1)
      const result = service.floorInterval(15, now)
      expect(result.getHours()).toBe(21)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
    })
  })

  describe(DiscortEventsNotifierService.prototype.ceilInterval.name, () => {
    it('should return date correctly', () => {
      const now = new Date(2024, 0, 1, 21, 0, 2, 0)
      const result = service.ceilInterval(15, now)
      expect(result.getHours()).toBe(21)
      expect(result.getMinutes()).toBe(14)
      expect(result.getSeconds()).toBe(59)
      expect(result.getMilliseconds()).toBe(0)
    })
  })

  describe(DiscortEventsNotifierService.prototype.generateContent.name, () => {
    const message = ':calendar_spiral: **Upcoming events**'
    it('should return message by default', () => {
      expect(service.generateContent(message)).toBe(':calendar_spiral: **Upcoming events**')
    })

    it('should return with mentioned', () => {
      const events = [
        new DiscordEmbedEvent().setAttendees(['1', '2']),
        new DiscordEmbedEvent().setAttendees(['2', '3']),
      ]
      expect(service.generateContent(message, events)).toBe(':calendar_spiral: **Upcoming events**\n<@1> <@2> <@3>')
    })
  })
})
