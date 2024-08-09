import { DiscordEmbedEvent } from './discord-embed-event.model'

describe(DiscordEmbedEvent.name, () => {
  describe(DiscordEmbedEvent.prototype.replaceDiscordUrlWithChannel.name, () => {
    it('should replace correctly', () => {
      const result = new DiscordEmbedEvent().replaceDiscordUrlWithChannel('Join https://discord.com/channels/111/2222')
      expect(result).toBe('Join <#2222>')
    })
  })
})
