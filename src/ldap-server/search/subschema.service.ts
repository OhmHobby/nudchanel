import { Inject, Injectable, Logger } from '@nestjs/common'
import { Server } from 'ldapjs'
import { ServiceProvider } from 'src/enums/service-provider.enum'

@Injectable()
export class SearchSubschemaService {
  private readonly logger = new Logger(SearchSubschemaService.name)

  constructor(
    @Inject(ServiceProvider.LDAP_SERVER)
    server: Server,
  ) {
    server.search('cn=Subschema', this.handler.bind(this))
  }

  private handler(req, res, next) {
    this.logger.log({ message: 'Sending Subschema' })
    res.send({
      dn: 'cn=Subschema',
      attributes: {
        objectclass: ['top', 'subentry', 'subschema', 'extensibleObject'],
        cn: ['Subschema'],
      },
    })
    res.end()
    return next()
  }
}
