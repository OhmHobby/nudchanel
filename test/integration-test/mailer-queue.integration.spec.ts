import { BullModule, getQueueToken } from '@nestjs/bullmq'
import { INestApplication } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Queue } from 'bullmq'
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston'
import { ClsModule } from 'nestjs-cls'
import { createTestAccount, TestAccount } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import { BullConfig } from 'src/configs/bull.config'
import { clsConfigFactory } from 'src/configs/cls.config'
import { configuration } from 'src/configs/configuration'
import { WinstonConfig } from 'src/configs/winston.config'
import { MailProcessorService } from 'src/delivery/mail/processor.service'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'

describe.skip('Mailer queue', () => {
  let iftest: jest.It = it.skip

  let app: INestApplication
  let testAccount: TestAccount | undefined
  let queue: Queue<Mail.Options>
  let mailProcessorService: MailProcessorService

  beforeAll(async () => {
    await Promise.race([
      async () => {
        try {
          testAccount = await createTestAccount()
          iftest = it
        } catch (err) {
          console.error(err)
        }
      },
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ])

    const overrideConfig = {
      delivery: {
        smtp: {
          host: testAccount?.smtp.host,
          port: testAccount?.smtp.port,
          secure: testAccount?.smtp.secure,
          username: testAccount?.user,
          password: testAccount?.pass,
        },
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({ ...configuration(), ...overrideConfig })],
        }),
        BullModule.forRootAsync({
          imports: [ConfigModule],
          useClass: BullConfig,
          inject: [ConfigService],
        }),
        BullModule.registerQueue({ name: BullQueueName.Email }),
        ClsModule.forRootAsync({ global: true, useFactory: clsConfigFactory }),
        WinstonModule.forRootAsync({ useClass: WinstonConfig }),
      ],
      providers: [MailProcessorService],
    }).compile()

    app = module.createNestApplication()
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
    await app.init()

    mailProcessorService = module.get(MailProcessorService)
    queue = module.get(getQueueToken(BullQueueName.Email))
  })

  it('should be defined', () => {
    expect(mailProcessorService).toBeDefined()
  })

  iftest('should send mail correctly', async () => {
    if (!testAccount) {
      return console.warn('Test account did not initialized, skipped the test')
    }
    const realImplementation = mailProcessorService.sendMail
    const spy = jest.spyOn(mailProcessorService, 'sendMail')
    spy.mockImplementation(realImplementation)

    await queue.add(BullJobName.Email, {
      from: '"WebDev" <noreply@nudchannel.com>',
      to: 'webdev@nudchannel.com',
      subject: 'Integration test - webservice',
      text: new Date().getTime().toString(),
    })

    while (!spy.mock.calls.length) {
      await new Promise((r) => setTimeout(r, 1000))
    }
    const result = await spy.mock.results[0].value
    expect(result.accepted).toHaveLength(1)
    expect(result.rejected).toHaveLength(0)
    expect(result.response).toContain('250 Accepted')
  })

  afterAll(async () => {
    await queue.close()
    return app.close()
  })
})
