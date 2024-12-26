import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Server } from 'ldapjs'
import { Config } from 'src/enums/config.enum'
import { LdapRequestScope } from 'src/enums/ldap-request-scope.enum'
import { ServiceProvider } from 'src/enums/service-provider.enum'

@Injectable()
export class SearchBaseService {
  private readonly logger = new Logger(SearchBaseService.name)

  private readonly baseDn: string

  constructor(
    @Inject(ServiceProvider.LDAP_SERVER)
    server: Server,
    configService: ConfigService,
  ) {
    this.baseDn = configService.getOrThrow(Config.LDAP_BASE_DN)
    server.search('', this.handler.bind(this))
  }

  handler(req, res, next) {
    if (req.scope === LdapRequestScope.Base && !req.filter.filters.length) {
      this.logger.log({ message: 'Sending baseObject' })
      res.send({
        dn: '',
        structuralObjectClass: 'OpenLDAProotDSE',
        configContext: 'cn=config',
        attributes: {
          objectclass: ['top', 'OpenLDAProotDS'],
          namingContexts: this.baseDn,
          supportedLDAPVersion: ['3'],
          subschemaSubentry: ['cn=Subschema'],
        },
      })
    }

    res.end()
    return next()
  }
}
