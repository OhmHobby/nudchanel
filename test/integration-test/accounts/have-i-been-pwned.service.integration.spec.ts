import { INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston'
import { ClsModule } from 'nestjs-cls'
import { HaveIBeenPwnedService } from 'src/accounts/user/have-i-been-pwned.service'
import { clsConfigFactory } from 'src/configs/cls.config'
import { configuration } from 'src/configs/configuration'
import { WinstonConfig } from 'src/configs/winston.config'

describe('HaveIBeenPwnedService', () => {
  let app: INestApplication
  let haveIBeenPwnedService: HaveIBeenPwnedService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
        ClsModule.forRootAsync({ global: true, useFactory: clsConfigFactory }),
        WinstonModule.forRootAsync({ useClass: WinstonConfig }),
      ],
      providers: [HaveIBeenPwnedService],
    }).compile()

    app = module.createNestApplication()
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
    await app.init()

    haveIBeenPwnedService = module.get(HaveIBeenPwnedService)
  })

  it('should be defined', () => {
    expect(haveIBeenPwnedService).toBeDefined()
  })

  it('should return true if password is pwned', async () => {
    const result = await haveIBeenPwnedService.isPwnedPassword('TestPa$$w0rd!')
    expect(result).toBe(true)
  })

  afterAll(() => {
    return app.close()
  })
})
