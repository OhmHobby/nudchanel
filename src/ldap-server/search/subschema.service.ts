import { Inject, Injectable, Logger } from '@nestjs/common'
import { OperationsError, parseDN, Server } from 'ldapjs'
import { ServiceProvider } from 'src/enums/service-provider.enum'
import { LdapMetricService } from '../metric.service'

@Injectable()
export class SearchSubschemaService {
  private readonly logger = new Logger(SearchSubschemaService.name)

  constructor(
    @Inject(ServiceProvider.LDAP_SERVER)
    server: Server,
    ldapMetricService: LdapMetricService,
  ) {
    server.search('cn=Subschema', this.handler.bind(this), ldapMetricService.searchMetric.bind(ldapMetricService))
  }

  private handler(req, res, next) {
    this.logger.log({ message: 'Sending Subschema', req: req.json })
    const object = {
      dn: parseDN('cn=Subschema'),
      attributes: {
        objectclass: ['top', 'subentry', 'subschema', 'extensibleObject'],
        cn: ['Subschema'],
      },
    }
    try {
      res.send(object)
      this.logger.log({ message: 'Sent Subschema', req: req.json })
      res.end()
      return next()
    } catch (err) {
      this.logger.error({ message: err.message, req: req.json }, err)
      return next(new OperationsError())
    }
  }
}
