import { InjectConnection } from '@m8a/nestjs-typegoose'
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { Collection, Connection, Types } from 'mongoose'
import { ClsService } from 'nestjs-cls'
import { TraceService } from 'nestjs-otel'
import { Observable } from 'rxjs'
import { Request } from 'src/auth/request.interface'
import { Config } from 'src/enums/config.enum'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { AUDIT_LOG_COLLECTION_NAME, AuditLogModel } from 'src/models/audit/audit-log.model'
import MUUID from 'uuid-mongodb'
import { AUDIT_LOG_METADATA_KEY } from './audit-log.decorator'

@Injectable()
export class AuditLogger implements NestInterceptor {
  private readonly logger = new Logger(AuditLogger.name)

  private readonly auditLogModel: Collection<AuditLogModel>

  constructor(
    private readonly reflector: Reflector,
    private readonly cls: ClsService,
    private readonly configService: ConfigService,
    private readonly traceService: TraceService,
    @InjectConnection(MongoConnection.Audit)
    private readonly connection: Connection,
  ) {
    this.auditLogModel = this.connection.collection<AuditLogModel>(AUDIT_LOG_COLLECTION_NAME)
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
    const span = this.traceService.startSpan('AuditLogger.intercept')
    const action = this.reflector.get<string>(AUDIT_LOG_METADATA_KEY, context.getHandler())
    const request: Request = context.switchToHttp().getRequest()

    if (action) {
      this.insert(action, request)
    }
    span.end()
    return next.handle()
  }

  async insert(action: string, request: Request) {
    const span = this.traceService.startSpan('AuditLogger.insert')
    const model = new AuditLogModel({
      action,
      actor: request.user?.id ? new Types.ObjectId(request.user.id) : undefined,
      path: request.path,
      params: request.params,
      queries: request.query,
      body: request.body,
      correlation_id: MUUID.from(this.cls.getId()),
    })
    if (!this.configService.get(Config.AUDIT_LOG_ENABLED)) {
      this.logger.log({ message: `Skipped inserting audit`, ...model })
    }
    try {
      await this.auditLogModel.insertOne(model)
    } catch (err) {
      this.logger.error({ message: `Failed to insert audit log: ${err.message}`, ...model }, err)
    } finally {
      span.end()
    }
  }
}
