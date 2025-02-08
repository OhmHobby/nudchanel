import { Snowflake } from '@discordjs/core'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { Queue } from 'bullmq'
import { ProfileNameService } from 'src/accounts/profile/profile-name.service'
import { ProfileService } from 'src/accounts/profile/profile.service'
import { TeamService } from 'src/accounts/team/team.service'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { DiscordBotService } from './discord-bot.service'

@Injectable()
export class DiscordService implements OnModuleDestroy {
  private static readonly allTeamSuffix = ' (All)'

  private readonly logger = new Logger(DiscordService.name)

  constructor(
    private readonly discordBotService: DiscordBotService,
    private readonly profileService: ProfileService,
    private readonly profileNameService: ProfileNameService,
    private readonly teamService: TeamService,
    @InjectQueue(BullQueueName.Discord)
    private readonly queue: Queue<string>,
  ) {}

  async triggerProfileSyncAll(delayFactorMs: number) {
    const discordIds = await this.profileService.findAllDiscordIds()
    await this.queue.addBulk(
      discordIds.map((discordId, i) => ({
        name: BullJobName.DiscordProfileSync,
        data: discordId,
        opts: { delay: delayFactorMs * i },
      })),
    )
    return discordIds
  }

  async triggerProfileNameSync(discordId: Snowflake) {
    const profile = await this.profileService.findByDiscordId(discordId)
    if (!profile) return this.logger.warn(`Could not find profile for discordId: "${discordId}"`)
    const nickname = await this.profileNameService.getNickNameWithFirstNameAndInitialWithRoleEmojiPrefix(profile._id)
    if (!nickname) return this.logger.warn(`Could not create nickname for profileId: "${profile._id}"`)
    const promises = profile.discord_ids?.map((discordId, i) =>
      this.discordBotService.setNickname(discordId, this.nicknameWithSuffix(nickname, i)),
    )
    await Promise.all(promises ?? [])
  }

  async triggerProfileRoleSync(discordId: Snowflake) {
    const profile = await this.profileService.findByDiscordId(discordId)
    if (!profile) return this.logger.warn(`Could not find profile for discordId: "${discordId}"`)
    const [latestProfileRole, profileMembers, discordUser, guildRoles] = await Promise.all([
      this.teamService.getLatestProfilePrimaryTeam(profile._id),
      this.teamService.getProfilePrimaryTeams(profile._id),
      this.discordBotService.getUserById(discordId),
      this.getSyncedDiscordRoles(),
    ])
    if (!discordUser) return

    const profileYears = profileMembers.map((el) => el.year.toString())
    const profileRoleNames = profileMembers.map((el) => el.populatedRoles?.at(0)?.name + DiscordService.allTeamSuffix)
    const latestYear = Math.max(...guildRoles.map((el) => +el.name).filter((el) => !isNaN(el)))
    const profileYear = Math.max(...profileMembers.map((el) => el.year))
    const isActiveCurrentYear = latestYear === profileYear
    const targetGuildRoleIds = guildRoles
      .filter(
        (role) =>
          profileYears.includes(role.name) ||
          profileRoleNames.includes(role.name) ||
          (isActiveCurrentYear && role.name === latestProfileRole?.name) ||
          role.name === latestProfileRole?.name + DiscordService.allTeamSuffix,
      )
      .map((role) => role.id)
    const toAddRoleIds = targetGuildRoleIds.filter((id) => !discordUser.roles.includes(id))
    const toRemoveRoleIds = guildRoles
      .filter((role) => discordUser.roles.includes(role.id) && !targetGuildRoleIds.includes(role.id))
      .map((el) => el.id)
    await this.discordBotService.addRoleToMember(discordId, toAddRoleIds)
    await this.discordBotService.removeRoleFromMember(discordId, toRemoveRoleIds)
  }

  private async getSyncedTeamRoles() {
    const teamRoles = await this.teamService.getPrimaryTeamRoles()
    const allSuffixTeamRoles = teamRoles.map((team) => ({ ...team, name: team.name + DiscordService.allTeamSuffix }))
    return [...teamRoles, ...allSuffixTeamRoles]
  }

  async getSyncedDiscordRoles() {
    const [years, teamRoles, discordRoles] = await Promise.all([
      this.teamService.getPrimaryTeamYears(),
      this.getSyncedTeamRoles(),
      this.discordBotService.getRoles(),
    ])
    return discordRoles.filter(
      (discordRole) =>
        teamRoles.find((team) => team.name === discordRole.name) ||
        years.find((year) => year.toString() === discordRole.name),
    )
  }

  async triggerRoleSyncAll() {
    const [years, teamRoles, discordRoles] = await Promise.all([
      this.teamService.getPrimaryTeamYears(),
      this.getSyncedTeamRoles(),
      this.discordBotService.getRoles(),
    ])
    const teamRolesToCreateDiscordRoles = teamRoles.filter(
      (teamRole) => !discordRoles.find((discordRole) => discordRole.name === teamRole.name),
    )
    const yearsToCreateDiscordRoles = years.filter(
      (year) => !discordRoles.find((discordRole) => discordRole.name === year.toString()),
    )
    for (const team of teamRolesToCreateDiscordRoles) {
      await this.discordBotService.createRole({ name: team.name, permissions: '453156261440' })
    }
    for (const year of yearsToCreateDiscordRoles) {
      await this.discordBotService.createRole({ name: year.toString() })
    }
  }

  nicknameWithSuffix(nickname: string, index = 0) {
    return index > 0 ? `${nickname} ${index + 1}` : nickname
  }

  async onModuleDestroy() {
    await this.queue.close()
    this.logger.log('Successfully closed bull queues')
  }
}
