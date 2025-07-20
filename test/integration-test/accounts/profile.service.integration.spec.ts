import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston'
import { ClsModule } from 'nestjs-cls'
import { ProfileService } from 'src/accounts/profile/profile.service'
import { clsConfigFactory } from 'src/configs/cls.config'
import { configuration } from 'src/configs/configuration'
import { TypegooseConfigBuilderService } from 'src/configs/typegoose.config'
import { TypeormConfigService } from 'src/configs/typeorm.config'
import { WinstonConfig } from 'src/configs/winston.config'
import { ProfileDiscordEntity } from 'src/entities/accounts/profile-discord.entity'
import { ProfileGitlabEntity } from 'src/entities/accounts/profile-gitlab.entity'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { ProfileModel } from 'src/models/accounts/profile.model'

describe('Profile service', () => {
  let app: INestApplication
  let profileService: ProfileService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
        ClsModule.forRootAsync({ global: true, useFactory: clsConfigFactory }),
        WinstonModule.forRootAsync({ useClass: WinstonConfig }),
        TypegooseModule.forRootAsync(TypegooseConfigBuilderService.build(MongoConnection.Accounts)),
        TypegooseModule.forFeature([ProfileModel], MongoConnection.Accounts),
        TypeOrmModule.forRootAsync({ useClass: TypeormConfigService }),
        TypeOrmModule.forFeature([ProfileDiscordEntity, ProfileGitlabEntity]),
      ],
      providers: [ProfileService],
    }).compile()

    app = module.createNestApplication()
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
    await app.init()

    profileService = module.get(ProfileService)
  })

  it('should be defined', () => {
    expect(profileService).toBeDefined()
  })

  it('should return discord ids from emails correctly', async () => {
    const result = await profileService.discordIdsFromEmails(['nattawatj57@nu.ac.th', 'silas61@nu.ac.th'])
    expect(result).toEqual([expect.any(String), expect.any(String)])
  })

  afterAll(() => {
    return app.close()
  })
})
