import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { Test } from '@nestjs/testing'
import { User } from '@nudchannel/auth'
import { ClsModule } from 'nestjs-cls'
import { TraceService } from 'nestjs-otel'
import { AuditLogger } from 'src/audit-log/audit-logger.interceptor'
import { configuration } from 'src/configs/configuration'
import { TypegooseConfigBuilderService } from 'src/configs/typegoose.config'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { AuditLogModel } from 'src/models/audit/audit-log.model'
import request from 'supertest'
import { TestData } from 'test/test-data'
import { uuidv4 } from 'uuidv7'
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
        ClsModule.forRoot({
          global: true,
          middleware: { mount: true, generateId: true, idGenerator: uuidv4 },
        }),
        TypegooseModule.forRootAsync(TypegooseConfigBuilderService.build(MongoConnection.Audit)),
        TypegooseModule.forFeature([AuditLogModel], MongoConnection.Audit),
      ],
      providers: [{ provide: APP_INTERCEPTOR, useClass: AuditLogger }, TraceService],
      controllers: [AuditLoggerTestController],
    }).compile()

    app = module.createNestApplication()
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
    let doc: AuditLogModel | null = null
    do {
      doc = await controller.findByCorrelationId(result.body.correlationId)
    } while (!doc)
    expect(doc).not.toBeNull()
    expect(doc).toEqual(expect.objectContaining({ actor: TestData.aValidUserId }))
    expect(doc).toEqual(expect.objectContaining({ action: 'AuditLog Test' }))
    expect(doc).toEqual(expect.objectContaining({ path: '/1' }))
    expect(doc?.params).toEqual({ id: '1' })
    expect(doc?.queries).toEqual({ q: '2' })
    expect(doc?.body).toEqual({ test: 3 })
  })

  afterAll(() => {
    app.close()
  })
})
