import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OperationsError, parseDN, Server } from 'ldapjs'
import { Config } from 'src/enums/config.enum'
import { ServiceProvider } from 'src/enums/service-provider.enum'
import { LdapMetricService } from '../metric.service'

@Injectable()
export class SearchBaseService {
  private readonly logger = new Logger(SearchBaseService.name)

  private readonly baseDn: string

  constructor(
    @Inject(ServiceProvider.LDAP_SERVER)
    server: Server,
    configService: ConfigService,
    ldapMetricService: LdapMetricService,
  ) {
    this.baseDn = configService.getOrThrow(Config.LDAP_BASE_DN)
    server.search('', this.handler.bind(this), ldapMetricService.searchMetric.bind(ldapMetricService))
  }

  handler(req, res, next) {
    this.logger.log({ message: 'Searching base DN', req: req.json })
    const object = {
      dn: parseDN(''),
      structuralObjectClass: 'OpenLDAProotDSE',
      configContext: 'cn=config',
      attributes: {
        structuralObjectClass: 'OpenLDAProotDSE',
        configContext: 'cn=config',
        objectclass: ['top', 'OpenLDAProotDS'],
        namingContexts: this.baseDn,
        supportedLDAPVersion: ['3'],
        subschemaSubentry: ['cn=Subschema'],
      },
    }
    try {
      res.send(object)
      this.logger.log({ message: 'Sent baseObject', req: req.json })
      res.end()
      return next()
    } catch (err) {
      this.logger.error({ message: err.message, req: req.json }, err)
      return next(new OperationsError())
    }
  }
}
