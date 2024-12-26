import { Injectable, Logger } from '@nestjs/common'
import { SearchDnOrganizationService } from './organization.service'

@Injectable()
export class SearchDnOrganizationalRoleService extends SearchDnOrganizationService {
  protected readonly logger = new Logger(SearchDnOrganizationalRoleService.name)

  protected get objects() {
    return [
      {
        dn: 'cn=root',
        attributes: {
          objectclass: ['simpleSecurityObject', 'organizationalRole'],
          hasSubordinates: ['FALSE'],
        },
      },
    ]
  }
}
