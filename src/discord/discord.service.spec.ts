import { APIRole } from '@discordjs/core'
import { getQueueToken } from '@nestjs/bull'
import { Test, TestingModule } from '@nestjs/testing'
import { ProfileNameService } from 'src/accounts/profile/profile-name.service'
import { ProfileService } from 'src/accounts/profile/profile.service'
import { TeamService } from 'src/accounts/team/team.service'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { TeamMemberModel } from 'src/models/accounts/team-member.model'
import { TeamRoleModel } from 'src/models/accounts/team-role.model'
import { DiscordBotService } from './discord-bot.service'
import { DiscordService } from './discord.service'

jest.mock('src/accounts/profile/profile-name.service')
jest.mock('src/accounts/profile/profile.service')
jest.mock('src/accounts/team/team.service')
jest.mock('./discord-bot.service')

describe(DiscordService.name, () => {
  let service: DiscordService
  let botService: DiscordBotService
  let profileService: ProfileService
  let profileNameService: ProfileNameService
  let teamService: TeamService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordService,
        DiscordBotService,
        ProfileService,
        ProfileNameService,
        TeamService,
        { provide: getQueueToken(BullQueueName.Discord), useValue: jest.fn() },
      ],
    }).compile()

    service = module.get(DiscordService)
    botService = module.get(DiscordBotService)
    profileService = module.get(ProfileService)
    profileNameService = module.get(ProfileNameService)
    teamService = module.get(TeamService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(DiscordService.prototype.triggerProfileNameSync.name, () => {
    it('should not trigger when no profile found', async () => {
      profileService.findByDiscordId = jest.fn().mockResolvedValue(null)
      await service.triggerProfileNameSync('discord-id')
      expect(botService.setNickname).not.toHaveBeenCalled()
    })

    it('should trigger when profile has 2 discord ids', async () => {
      const profile = new ProfileModel()
      profile.discord_ids = ['1', '2']
      profileService.findByDiscordId = jest.fn().mockResolvedValue(profile)
      profileNameService.getNickNameWithInitials = jest.fn().mockResolvedValue('nickname')
      profileNameService.getNickNameWithFirstNameAndInitial = jest.fn().mockResolvedValue('nickname')
      profileNameService.getNickNameWithFirstNameAndInitialWithRoleEmojiPrefix = jest.fn().mockResolvedValue('nickname')
      await service.triggerProfileNameSync('discord-id')
      expect(botService.setNickname).toHaveBeenCalledTimes(2)
    })
  })

  describe(DiscordService.prototype.triggerProfileRoleSync.name, () => {
    it('should add and remove roles correctly', async () => {
      const discordId = ''
      const profile = new ProfileModel()
      const currentTeamRole = new TeamRoleModel({ name: 'Team1' })
      const previousTeamRole = new TeamRoleModel({ name: 'Team2' })
      const currentTeam: Partial<TeamMemberModel> = { year: 2024, populatedRoles: [currentTeamRole as any] }
      const previousTeam: Partial<TeamMemberModel> = { year: 2023, populatedRoles: [previousTeamRole as any] }
      const discordSyncedRoles: Partial<APIRole>[] = [
        { id: '2024', name: '2024' },
        { id: '2023', name: '2023' },
        { id: '2022', name: '2022' },
        { id: 'Team1', name: 'Team1' },
        { id: 'Team2', name: 'Team2' },
        { id: 'Team3', name: 'Team3' },
        { id: 'Team1 (All)', name: 'Team1 (All)' },
        { id: 'Team2 (All)', name: 'Team2 (All)' },
        { id: 'Team3 (All)', name: 'Team3 (All)' },
      ]

      profileService.findByDiscordId = jest.fn().mockResolvedValue(profile)
      teamService.getLatestProfilePrimaryTeam = jest.fn().mockResolvedValue(currentTeamRole)
      teamService.getProfilePrimaryTeams = jest.fn().mockResolvedValue([currentTeam, previousTeam])
      botService.getUserById = jest.fn().mockResolvedValue({ roles: ['2023', 'Team2', 'Team2 (All)'] })
      service.getSyncedDiscordRoles = jest.fn().mockResolvedValue(discordSyncedRoles)

      await service.triggerProfileRoleSync(discordId)

      expect(botService.addRoleToMember).toHaveBeenCalledWith(discordId, ['2024', 'Team1', 'Team1 (All)'])
      expect(botService.removeRoleFromMember).toHaveBeenCalledWith(discordId, ['Team2'])
    })
  })

  describe(DiscordService.prototype.getSyncedDiscordRoles.name, () => {
    it('should return the list correctly', async () => {
      teamService.getPrimaryTeamYears = jest.fn().mockResolvedValue([2024, 2023])
      teamService.getPrimaryTeamRoles = jest.fn().mockResolvedValue([{ name: 'Team1' }, { name: 'Team2' }])
      botService.getRoles = jest
        .fn()
        .mockResolvedValue([{ name: 'Team1' }, { name: 'Team1 (All)' }, { name: '2024' }, { name: 'Test' }])
      const result = await service.getSyncedDiscordRoles()
      expect(result.map((el) => el.name)).toEqual(['Team1', 'Team1 (All)', '2024'])
    })
  })

  describe(DiscordService.prototype.triggerRoleSyncAll.name, () => {
    it('should return the list correctly', async () => {
      teamService.getPrimaryTeamYears = jest.fn().mockResolvedValue([2024, 2023])
      teamService.getPrimaryTeamRoles = jest.fn().mockResolvedValue([{ name: 'Team1' }, { name: 'Team2' }])
      botService.getRoles = jest
        .fn()
        .mockResolvedValue([{ name: 'Team1' }, { name: 'Team1 (All)' }, { name: '2024' }, { name: 'Test' }])
      await service.triggerRoleSyncAll()
      expect(botService.createRole).toHaveBeenCalledTimes(3)
      expect(botService.createRole).toHaveBeenCalledWith(expect.objectContaining({ name: 'Team2' }))
      expect(botService.createRole).toHaveBeenCalledWith(expect.objectContaining({ name: 'Team2 (All)' }))
      expect(botService.createRole).toHaveBeenCalledWith(expect.objectContaining({ name: '2023' }))
    })
  })

  describe(DiscordService.prototype.nicknameWithSuffix.name, () => {
    it('should return suffix when index more than 0', () => {
      const result = service.nicknameWithSuffix('Nickname', 1)
      expect(result).toBe('Nickname 2')
    })

    it('should not return suffix when index is 0', () => {
      const result = service.nicknameWithSuffix('Nickname')
      expect(result).toBe('Nickname')
    })
  })
})
