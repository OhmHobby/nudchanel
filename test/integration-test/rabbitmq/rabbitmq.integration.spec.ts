import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { configuration } from 'src/configs/configuration'
import { Config } from 'src/enums/config.enum'
import { RabbitTestConfigService } from './rabbit-test-config.service'
import { RabbitTestService } from './rabbit-test.service'
import { INestApplication } from '@nestjs/common'

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
      ],
      providers: [RabbitTestService],
    }).compile()

    app = module.createNestApplication()
    await app.init()

    service = module.get(RabbitTestService)
  }, +configuration()[Config.RABBITMQ_WAIT_TIMEOUT])

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should publish and receive correctly', async () => {
    await service.publish()
    while (!service.haveBeenCalled) {
      await new Promise((r) => setTimeout(r, 1000))
    }
    expect(service.haveBeenCalled).toBeGreaterThan(0)
  })

  afterAll(() => {
    return app.close()
  })
})
