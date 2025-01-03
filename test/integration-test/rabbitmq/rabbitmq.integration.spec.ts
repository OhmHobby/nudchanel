import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston'
import { ClsModule } from 'nestjs-cls'
import { clsConfigFactory } from 'src/configs/cls.config'
import { configuration } from 'src/configs/configuration'
import { WinstonConfig } from 'src/configs/winston.config'
import { Config } from 'src/enums/config.enum'
import { RabbitTestConfigService } from './rabbit-test-config.service'
import { RabbitTestService } from './rabbit-test.service'

describe('RabbitMQ', () => {
  let app: INestApplication
  let service: RabbitTestService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
        RabbitMQModule.forRootAsync(RabbitMQModule, {
          useClass: RabbitTestConfigService,
        }),
        ClsModule.forRootAsync({ global: true, useFactory: clsConfigFactory }),
        WinstonModule.forRootAsync({ useClass: WinstonConfig }),
      ],
      providers: [RabbitTestService],
    }).compile()

    app = module.createNestApplication()
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
    await app.init()

    service = module.get(RabbitTestService)
  }, +configuration()[Config.RABBITMQ_WAIT_TIMEOUT])

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should publish and receive correctly', async () => {
    await service.publish()
    for (let attempts = 15; attempts && !service.haveBeenCalled; attempts--) {
      await new Promise<void>((r) => setTimeout(() => r(), 1000))
    }
    expect(service.haveBeenCalled).toBeGreaterThan(0)
  }, 30000)

  afterAll(() => {
    return app.close()
  })
})
