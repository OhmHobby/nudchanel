import {
  GatewayTimeoutException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request, Response } from 'express'
import { RequestHandler, createProxyMiddleware } from 'http-proxy-middleware'
import { Config } from 'src/enums/config.enum'
import { ProxyConfig } from './proxy-config.type'

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name)

  private readonly proxy: Record<string, RequestHandler>

  constructor(configService: ConfigService) {
    this.proxy = this.buildProxy(configService.get(Config.HTTP_PROXY))
    this.logger.log({ message: 'Proxy initialized', proxy: Object.keys(this.proxy) })
  }

  getRequestHandler(service: string) {
    return this.proxy[service]
  }

  onError(error: Error, req: Request, res: Response, target: string) {
    this.logger.error({ message: error.message, target }, error)
    switch (error['code']) {
      case 'ENETUNREACH':
        return res.status(HttpStatus.BAD_GATEWAY).json(new ServiceUnavailableException().getResponse())
      case 'ECONNREFUSED':
        return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(new ServiceUnavailableException().getResponse())
      case 'ECONNRESET':
        return res.status(HttpStatus.GATEWAY_TIMEOUT).json(new GatewayTimeoutException().getResponse())
      default:
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new InternalServerErrorException().getResponse())
    }
  }

  private buildProxy(services: Record<string, ProxyConfig> = {}) {
    const entries = Object.entries(services).map(([service, config]) => [
      service,
      createProxyMiddleware({
        target: config.target,
        changeOrigin: true,
        logLevel: 'silent',
        onError: this.onError.bind(this),
      }),
    ])
    return Object.fromEntries(entries)
  }
}
