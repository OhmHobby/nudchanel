import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SearchDnOrganizationService } from './organization.service'

@Injectable()
export class SearchDnOrganizationalUnitService extends SearchDnOrganizationService {
  protected readonly logger = new Logger(SearchDnOrganizationalUnitService.name)

  constructor(configService: ConfigService) {
    super(configService)
  }

  protected get objects() {
    return [
      {
        dn: 'ou=users, ' + this.baseDn,
        attributes: {
          objectclass: ['top', 'organizationalUnit'],
          ou: 'users',
        },
      },
      {
        dn: 'ou=groups, ' + this.baseDn,
        attributes: {
          objectclass: ['top', 'organizationalUnit'],
          ou: 'groups',
        },
      },
    ]
  }
}
