import { Inject, Injectable, Logger } from '@nestjs/common'
import { OperationsError, parseDN, Server } from 'ldapjs'
import { ServiceProvider } from 'src/enums/service-provider.enum'

@Injectable()
export class SearchSubschemaService {
  private readonly logger = new Logger(SearchSubschemaService.name)

  constructor(
    @Inject(ServiceProvider.LDAP_SERVER)
    server: Server,
  ) {
    server.search('cn=Subschema', this.handler.bind(this))
    this.logger.verbose(`Init ${SearchSubschemaService.name}`)
  }

  private handler(req, res, next) {
    this.logger.log({ message: 'Sending Subschema', req: req.pojo })
    const object = {
      dn: parseDN('cn=Subschema'),
      attributes: {
        objectclass: ['top', 'subentry', 'subschema', 'extensibleObject'],
        cn: ['Subschema'],
      },
    }
    try {
      res.send(object)
      this.logger.log({ message: 'Sent Subschema', pojo: req.pojo })
      res.end()
      return next()
    } catch (err) {
      this.logger.error({ message: err.message, pojo: req.pojo }, err)
      return next(new OperationsError())
    }
  }
}
