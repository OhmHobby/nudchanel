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
import { RequestWithCtx } from 'src/interfaces/request.interface'
import { SKIP_HTTP_LOGGING } from './skip-http-logging.decorator'

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  readonly logger = new Logger('HTTP')

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const startTime = Date.now()
    const controller = context.getClass().name
    const handler = context.getHandler().name
    const request: RequestWithCtx = context.switchToHttp().getRequest()
    const response: Response = context.switchToHttp().getResponse()
    if (this.shouldSkip(context)) {
      return next.handle()
    } else {
      return next
        .handle()
        .pipe(
          tap(() => {
            this.log(startTime, controller, handler, request, response)
          }),
        )
        .pipe(
          catchError((err: HttpException) => {
            this.log(startTime, controller, handler, request, response, err)
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

  log(
    startTime: number,
    controller: string,
    handler: string,
    request?: RequestWithCtx,
    response?: Response,
    err?: HttpException,
  ) {
    const status = err?.getStatus?.() ?? (err ? HttpStatus.INTERNAL_SERVER_ERROR : response?.statusCode)
    this.logger[this.logLevel(status)]({
      method: request?.method,
      path: request?.path,
      query: request?.query,
      params: request?.params,
      status,
      controller,
      handler,
      exception: err?.name,
      error: err?.message,
      responseTime: Date.now() - startTime,
      userId: request?.user?.id ?? undefined, // null => undefined
    })
  }

  logLevel(httpStatus: number = 0) {
    if (httpStatus >= HttpStatus.INTERNAL_SERVER_ERROR) return 'error'
    else if (httpStatus < HttpStatus.BAD_REQUEST) return 'log'
    else return 'warn'
  }
}
