import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InvalidCredentialsError, Server } from 'ldapjs'
import { Config } from 'src/enums/config.enum'
import { ServiceProvider } from 'src/enums/service-provider.enum'

@Injectable()
export class BindRootService {
  private readonly logger = new Logger(BindRootService.name)

  constructor(
    @Inject(ServiceProvider.LDAP_SERVER)
    server: Server,
    private readonly configService: ConfigService,
  ) {
    server.bind('cn=root', this.handler.bind(this))
  }

  handler(req, res, next) {
    const credentials = req.credentials.toString()
    res.end()
    if (credentials === this.configService.getOrThrow(Config.LDAP_ROOT_SECRET)) {
      this.logger.log('Binding root successfully')
      return next()
    } else {
      this.logger.warn('Binding root with invalid credential')
      return next(new InvalidCredentialsError())
    }
  }
}
