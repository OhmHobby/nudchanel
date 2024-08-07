import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@Controller({ path: 'audit-logs', version: '1' })
@ApiTags('AuditLogV1')
export class AuditLogV1Controller {}
