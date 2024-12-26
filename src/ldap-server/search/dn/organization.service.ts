import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/enums/config.enum'
import { LdapRequestScope } from 'src/enums/ldap-request-scope.enum'
import { LdapRequest } from 'src/ldap-server/types/ldap-request.type'

@Injectable()
export class SearchDnOrganizationService {
  protected readonly logger = new Logger(SearchDnOrganizationService.name)

  protected readonly baseDn: string

  constructor(configService: ConfigService) {
    this.baseDn = configService.getOrThrow(Config.LDAP_BASE_DN)
  }

  protected get objects() {
    return [
      {
        dn: this.baseDn,
        attributes: {
          objectclass: ['top', 'dcObject', 'organization'],
        },
      },
    ]
  }

  handler(req: LdapRequest, res) {
    if (req.scope === LdapRequestScope.Base) {
      return this.baseHandler(req, res)
    } else {
      return this.subHandler(req, res)
    }
  }

  private baseHandler(req, res) {
    return this.objects
      .filter((object) => {
        const match = req.dn?.equals(object.dn)
        this.logger.debug({ message: 'Checking searchDn base', dn: req.dn, match, object })
        return match
      })
      .map((object) => {
        res.send(object)
        return object
      })
  }

  private subHandler(req, res) {
    return this.objects
      .filter((object) => {
        const match = req.filter.matches(object.attributes)
        this.logger.debug({ message: 'Checking searchDn sub', filter: req.filter, match, object })
        return match
      })
      .map((object) => {
        res.send(object)
        return object
      })
  }
}
