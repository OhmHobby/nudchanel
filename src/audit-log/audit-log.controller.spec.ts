import { Test, TestingModule } from '@nestjs/testing'
import { AuditLogV1Controller } from './audit-log.v1.controller'

describe(AuditLogV1Controller.name, () => {
  let controller: AuditLogV1Controller

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogV1Controller],
    }).compile()

    controller = module.get<AuditLogV1Controller>(AuditLogV1Controller)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
