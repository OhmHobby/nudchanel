import { CallHandler, ExecutionContext, HttpException, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Response } from 'express'
import { catchError, Observable, tap } from 'rxjs'
import { Request } from 'src/auth/request.interface'

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const startTime = Date.now()
    const request: Request = context.switchToHttp().getRequest()
    const response: Response = context.switchToHttp().getResponse()
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

  private log(startTime: number, request: Request, response?: Response, err?: HttpException) {
    this.logger.log({
      method: request.method,
      path: request.path,
      query: request.query,
      status: err?.getStatus() ?? response?.statusCode,
      error: err?.message,
      responseTime: Date.now() - startTime,
      userId: request?.user?.id ?? undefined,
    })
  }
}
