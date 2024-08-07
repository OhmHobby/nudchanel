import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { Module } from '@nestjs/common'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { AuditLogModel } from 'src/models/audit/audit-log.model'
import { AuditLogService } from './audit-log.service'
import { AuditLogV1Controller } from './audit-log.v1.controller'

@Module({
  imports: [TypegooseModule.forFeature([AuditLogModel], MongoConnection.Audit)],
  providers: [AuditLogService],
  controllers: [AuditLogV1Controller],
})
export class AuditLogModule {}
