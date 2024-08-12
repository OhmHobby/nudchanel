import { BullModule, getQueueToken } from '@nestjs/bull'
import { INestApplication } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Queue } from 'bull'
import { createTestAccount, TestAccount } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import { BullConfig } from 'src/configs/bull.config'
import { configuration } from 'src/configs/configuration'
import { MailProcessorService } from 'src/delivery/mail/processor.service'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'

describe('Mailer queue', () => {
  let app: INestApplication
  let testAccount: TestAccount
  let queue: Queue<Mail.Options>
  let mailProcessorService: MailProcessorService

  beforeAll(async () => {
    try {
      testAccount = await createTestAccount()
    } catch (err) {
      console.error(err)
    }

    const overrideConfig = {
      delivery: {
        smtp: {
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          username: testAccount.user,
          password: testAccount.pass,
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
      ],
      providers: [MailProcessorService],
    }).compile()

    app = module.createNestApplication()
    await app.init()

    mailProcessorService = module.get(MailProcessorService)
    queue = module.get(getQueueToken(BullQueueName.Email))
  })

  it('should be defined', () => {
    expect(mailProcessorService).toBeDefined()
  })

  it('should send mail correctly', async () => {
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

  afterAll(() => {
    app.close()
  })
})
