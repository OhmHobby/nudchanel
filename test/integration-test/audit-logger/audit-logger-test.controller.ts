import { InjectModel } from '@m8a/nestjs-typegoose'
import { Controller, Injectable, Param, Post } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { ClsService } from 'nestjs-cls'
import { AuditLog } from 'src/audit-log/audit-log.decorator'
import { AuditLogModel } from 'src/models/audit/audit-log.model'
import MUUID from 'uuid-mongodb'

@Controller()
@Injectable()
export class AuditLoggerTestController {
  constructor(
    private readonly cls: ClsService,
    @InjectModel(AuditLogModel)
    private readonly auditLogModel: ReturnModelType<typeof AuditLogModel>,
  ) {}

  @Post(':id')
  @AuditLog('AuditLog Test')
  test(@Param('id') id: string) {
    return { id, correlationId: this.cls.getId() }
  }

  findByCorrelationId(id: string) {
    return this.auditLogModel.findOne({ correlation_id: MUUID.from(id) }).exec()
  }
}
