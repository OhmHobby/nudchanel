import { Module } from '@nestjs/common'
import { AuditLogService } from './audit-log.service'
import { AuditLogV1Controller } from './audit-log.v1.controller'

@Module({
  providers: [AuditLogService],
  controllers: [AuditLogV1Controller],
})
export class AuditLogModule {}
