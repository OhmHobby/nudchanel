import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { InjectDataSource } from '@nestjs/typeorm'
import { ClsService } from 'nestjs-cls'
import { TraceService } from 'nestjs-otel'
import { Observable } from 'rxjs'
import { AuditLogEntity } from 'src/entities/audit-log.entity'
import { Config } from 'src/enums/config.enum'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { DataSource, Repository } from 'typeorm'
import { AUDIT_LOG_METADATA_KEY } from './audit-log.decorator'
import { RequestWithCtx } from 'src/interfaces/request.interface'

@Injectable()
export class AuditLogger implements NestInterceptor {
  private readonly logger = new Logger(AuditLogger.name)

  private readonly auditLogRepository: Repository<AuditLogEntity>

  constructor(
    private readonly reflector: Reflector,
    private readonly cls: ClsService,
    private readonly configService: ConfigService,
    private readonly traceService: TraceService,
    @InjectDataSource()
    dataSource: DataSource,
  ) {
    this.auditLogRepository = dataSource.getRepository(AuditLogEntity)
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
    const span = this.traceService.startSpan('AuditLogger.intercept')
    const action = this.reflector.get<string>(AUDIT_LOG_METADATA_KEY, context.getHandler())
    const request: RequestWithCtx = context.switchToHttp().getRequest()

    if (action) {
      this.insert(action, request)
    }
    span.end()
    return next.handle()
  }

  async insert(action: string, request: RequestWithCtx) {
    const span = this.traceService.startSpan('AuditLogger.insert')
    const model = new AuditLogEntity({
      action,
      actor: request.user?.id ? ObjectIdUuidConverter.toUuid(request.user.id) : null,
      path: request.path,
      params: request.params,
      queries: request.query,
      body: request.body,
      correlationId: this.cls.getId(),
    })
    if (!this.configService.get(Config.AUDIT_LOG_ENABLED)) {
      this.logger.log({ message: `Skipped inserting audit`, ...model })
    }
    try {
      await this.auditLogRepository.insert(model)
    } catch (err) {
      this.logger.error({ message: `Failed to insert audit log: ${err.message}`, ...model }, err)
    } finally {
      span.end()
    }
  }
}
