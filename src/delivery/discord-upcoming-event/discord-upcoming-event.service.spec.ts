import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { GoogleCalendarService } from 'src/google/google-calendar.service'
import { DiscordEmbedEvent } from './discord-embed-event.model'
import { DiscordUpcomingEventService } from './discord-upcoming-event.service'
import { ProfileService } from 'src/accounts/profile/profile.service'

jest.mock('@nestjs/config')
jest.mock('src/google/google-calendar.service')
jest.mock('src/accounts/profile/profile.service')

describe('DiscordUpcomingEventService', () => {
  let service: DiscordUpcomingEventService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordUpcomingEventService, ConfigService, GoogleCalendarService, ProfileService],
    }).compile()

    service = module.get(DiscordUpcomingEventService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getHourAhead', () => {
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

  describe('generateContent', () => {
    it('should return message by default', () => {
      expect(service.generateContent()).toBe(':calendar_spiral: **Upcoming events**')
    })

    it('should return with mentioned', () => {
      const events = [
        new DiscordEmbedEvent().setAttendees(['1', '2']),
        new DiscordEmbedEvent().setAttendees(['2', '3']),
      ]
      expect(service.generateContent(events)).toBe(':calendar_spiral: **Upcoming events**\n<@1> <@2> <@3>')
    })
  })
})
