import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OperationsError, parseDN, Server } from 'ldapjs'
import { Config } from 'src/enums/config.enum'
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
    this.logger.verbose(`Init ${SearchBaseService.name}`)
  }

  handler(req, res, next) {
    this.logger.log({ message: 'Searching base DN', req: req.pojo })
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
      this.logger.log({ message: 'Sent baseObject', pojo: req.pojo })
      res.end()
      return next()
    } catch (err) {
      this.logger.error({ message: err.message, pojo: req.pojo }, err)
      return next(new OperationsError())
    }
  }
}
