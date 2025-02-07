import { INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { Test } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@nudchannel/auth'
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston'
import { ClsModule } from 'nestjs-cls'
import { TraceService } from 'nestjs-otel'
import { AuditLogger } from 'src/audit-log/audit-logger.interceptor'
import { clsConfigFactory } from 'src/configs/cls.config'
import { configuration } from 'src/configs/configuration'
import { TypeormConfigService } from 'src/configs/typeorm.config'
import { WinstonConfig } from 'src/configs/winston.config'
import { AuditLogEntity } from 'src/entities/audit-log.entity'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import request from 'supertest'
import { TestData } from 'test/test-data'
import { AuditLoggerTestController } from './audit-logger-test.controller'

describe('Audit logger', () => {
  let app: INestApplication
  let controller: AuditLoggerTestController

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
        ClsModule.forRootAsync({ global: true, useFactory: clsConfigFactory }),
        WinstonModule.forRootAsync({ useClass: WinstonConfig }),
        TypeOrmModule.forRootAsync({ useClass: TypeormConfigService }),
        TypeOrmModule.forFeature([AuditLogEntity]),
      ],
      providers: [{ provide: APP_INTERCEPTOR, useClass: AuditLogger }, TraceService],
      controllers: [AuditLoggerTestController],
    }).compile()

    app = module.createNestApplication()
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))

    app.use((req, res, next) => {
      req.user = new User({ id: TestData.aValidUserId.toHexString() })
      next()
    })

    controller = module.get(AuditLoggerTestController)
    await app.init()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should insert audit log correctly', async () => {
    const result = await request(app.getHttpServer()).post('/1?q=2').send({ test: 3 })
    let doc: AuditLogEntity | null = null
    for (let attempts = 15; attempts && !doc; attempts--) {
      process.stdout.write('.')
      doc = await controller.findByCorrelationId(result.body.correlationId)
      await new Promise<void>((r) => setTimeout(() => r(), 1000))
    }
    expect(doc).not.toBeNull()
    expect(doc).toEqual(expect.objectContaining({ actor: ObjectIdUuidConverter.toUuid(TestData.aValidUserId) }))
    expect(doc).toEqual(expect.objectContaining({ action: 'AuditLog Test' }))
    expect(doc).toEqual(expect.objectContaining({ path: '/1' }))
    expect(doc?.params).toEqual({ id: '1' })
    expect(doc?.queries).toEqual({ q: '2' })
    expect(doc?.body).toEqual({ test: 3 })
  }, 30000)

  afterAll(() => {
    return app.close()
  })
})
