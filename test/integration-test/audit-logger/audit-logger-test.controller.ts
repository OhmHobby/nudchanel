import { Controller, Injectable, Param, Post } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ClsService } from 'nestjs-cls'
import { AuditLog } from 'src/audit-log/audit-log.decorator'
import { AuditLogEntity } from 'src/entities/audit-log.entity'
import { Repository } from 'typeorm'

@Controller()
@Injectable()
export class AuditLoggerTestController {
  constructor(
    private readonly cls: ClsService,
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepository: Repository<AuditLogEntity>,
  ) {}

  @Post(':id')
  @AuditLog('AuditLog Test')
  test(@Param('id') id: string) {
    return { id, correlationId: this.cls.getId() }
  }

  findByCorrelationId(id: string) {
    return this.auditLogRepository.findOneBy({ correlationId: id })
  }
}
