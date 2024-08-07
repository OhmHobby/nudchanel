import { SetMetadata } from '@nestjs/common'

export const AUDIT_LOG_METADATA_KEY = 'AUDIT_LOG'

export const AuditLog = (value: String) => SetMetadata(AUDIT_LOG_METADATA_KEY, value)
