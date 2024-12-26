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
    this.logger.verbose(`Init ${BindRootService.name}`)
  }

  handler(req, res, next) {
    this.logger.log({ message: `Binding root ${req.dn.toString()}` })
    const credentials = req.credentials.toString()
    if (credentials === this.configService.getOrThrow(Config.LDAP_ROOT_SECRET)) {
      this.logger.log('Binding root successfully')
      res.end()
      return next()
    } else {
      this.logger.warn('Binding root with invalid credential')
      return next(new InvalidCredentialsError())
    }
  }
}
