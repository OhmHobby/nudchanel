import { API, RESTPostAPIGuildRoleJSONBody, Snowflake } from '@discordjs/core'
import { REST } from '@discordjs/rest'
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/enums/config.enum'

@Injectable()
export class DiscordBotService {
  static readonly defaultCacheTtlMs = 5000

  private readonly logger = new Logger(DiscordBotService.name)

  private readonly client: API

  private readonly primaryGuildId: Snowflake

  constructor(
    configService: ConfigService,
    @Inject(CACHE_MANAGER)
    protected readonly cacheManager: Cache,
  ) {
    const rest = new REST().setToken(configService.getOrThrow<string>(Config.DISCORD_TOKEN))
    this.client = new API(rest)
    this.primaryGuildId = configService.getOrThrow<Snowflake>(Config.DISCORD_PRIMARY_GUILD_ID)
  }

  async getCurrentUser() {
    return await this.client.users.getCurrent()
  }

  async getUserById(userId: Snowflake) {
    return await this.client.guilds.getMember(this.primaryGuildId, userId)
  }

  getRoles() {
    return this.cacheManager.wrap(
      `discord:${this.primaryGuildId}:roles`,
      () => this.client.guilds.getRoles(this.primaryGuildId),
      DiscordBotService.defaultCacheTtlMs,
    )
  }

  async createRole(body: RESTPostAPIGuildRoleJSONBody) {
    try {
      await this.client.guilds.createRole(this.primaryGuildId, body)
      this.logger.log(`Role ${body.name} created`)
    } catch (err) {
      this.logger.error(`Failed to create a role ${body.name}`, err)
    }
  }

  async setNickname(userId: Snowflake, nickname: string) {
    try {
      await this.client.guilds.editMember(this.primaryGuildId, userId, { nick: nickname })
      this.logger.log(`Set nickname ${userId}: ${nickname}`)
    } catch (err) {
      this.logger.error(`Failed to set nickname ${userId}: ${nickname} - ${err?.message}`, err)
    }
  }

  async addRoleToMember(userId: Snowflake, roleIds: Snowflake[]) {
    for (const roleId of roleIds) {
      try {
        await this.client.guilds.addRoleToMember(this.primaryGuildId, userId, roleId)
        this.logger.log(`Add role to ${userId}: ${roleId}`)
      } catch (err) {
        this.logger.error(`Failed to add role to ${userId}: ${roleId} - ${err?.message}`, err)
      }
    }
  }

  async removeRoleFromMember(userId: Snowflake, roleIds: Snowflake[]) {
    for (const roleId of roleIds) {
      try {
        await this.client.guilds.removeRoleFromMember(this.primaryGuildId, userId, roleId)
        this.logger.log(`Remove role from ${userId}: ${roleId}`)
      } catch (err) {
        this.logger.error(`Failed to remove role from ${userId}: ${roleId} - ${err?.message}`, err)
      }
    }
  }
}
