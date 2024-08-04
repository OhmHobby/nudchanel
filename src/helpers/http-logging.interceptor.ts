import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Response } from 'express'
import { catchError, Observable, tap } from 'rxjs'
import { Request } from 'src/auth/request.interface'
import { SKIP_HTTP_LOGGING } from './skip-http-logging.decorator'

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  readonly logger = new Logger('HTTP')

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const startTime = Date.now()
    const request: Request = context.switchToHttp().getRequest()
    const response: Response = context.switchToHttp().getResponse()
    if (this.shouldSkip(context)) {
      return next.handle()
    } else {
      return next
        .handle()
        .pipe(
          tap(() => {
            this.log(startTime, request, response)
          }),
        )
        .pipe(
          catchError((err: HttpException) => {
            this.log(startTime, request, response, err)
            throw err
          }),
        )
    }
  }

  shouldSkip(context: ExecutionContext): boolean {
    const decoratorSkip =
      this.reflector.get(SKIP_HTTP_LOGGING, context.getClass()) ||
      this.reflector.get(SKIP_HTTP_LOGGING, context.getHandler())
    return decoratorSkip
  }

  log(startTime: number, request?: Request, response?: Response, err?: HttpException) {
    const status = err?.getStatus?.() ?? (err ? HttpStatus.INTERNAL_SERVER_ERROR : response?.statusCode)
    this.logger.log({
      method: request?.method,
      path: request?.path,
      query: request?.query,
      status,
      exception: err?.name,
      error: err?.message,
      responseTime: Date.now() - startTime,
      userId: request?.user?.id ?? undefined, // null => undefined
    })
  }
}
