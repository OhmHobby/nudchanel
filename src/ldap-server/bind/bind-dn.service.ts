import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InvalidCredentialsError, Server } from 'ldapjs'
import { UserLocalService } from 'src/accounts/user/user-local.service'
import { Config } from 'src/enums/config.enum'
import { ServiceProvider } from 'src/enums/service-provider.enum'
import { LdapRequest } from '../types/ldap-request.type'
import { Span } from 'nestjs-otel'

@Injectable()
export class BindDnService {
  private readonly logger = new Logger(BindDnService.name)

  constructor(
    @Inject(ServiceProvider.LDAP_SERVER)
    server: Server,
    configService: ConfigService,
    private readonly userLocalService: UserLocalService,
  ) {
    server.bind(configService.getOrThrow(Config.LDAP_BASE_DN), this.handler.bind(this))
  }

  @Span()
  async handler(req: LdapRequest, res, next) {
    this.logger.log({ message: `Binding DN ${req.dn.toString()}` })
    try {
      const username = /uid=(\w+)/.exec(req.dn.toString())!.at(1)!
      const password = req.credentials!

      const user = await this.userLocalService.signIn(username, password)

      if (user) {
        this.logger.log({ message: 'Successful sign-in', username })
        res.end()
        return next()
      }

      throw new InvalidCredentialsError()
    } catch (err) {
      this.logger.error({ message: err.message, dn: req.dn })
      this.logger.debug(err)
      return next(new InvalidCredentialsError())
    }
  }
}
