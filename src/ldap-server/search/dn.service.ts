import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OperationsError, Server } from 'ldapjs'
import { Config } from 'src/enums/config.enum'
import { ServiceProvider } from 'src/enums/service-provider.enum'
import { LdapAuthorizeService } from '../authorize.service'
import { LdapRequest } from '../types/ldap-request.type'
import { SearchDnGroupService } from './dn/group.service'
import { SearchDnOrganizationService } from './dn/organization.service'
import { SearchDnOrganizationalRoleService } from './dn/organizational-role.service'
import { SearchDnOrganizationalUnitService } from './dn/organizational-unit.service'
import { SearchDnUserService } from './dn/user.service'
import { Span } from 'nestjs-otel'

@Injectable()
export class SearchDnService {
  private readonly logger = new Logger(SearchDnService.name)

  constructor(
    @Inject(ServiceProvider.LDAP_SERVER)
    server: Server,
    configService: ConfigService,
    private readonly searchDnOrganizationService: SearchDnOrganizationService,
    private readonly searchDnOrganizationalRoleService: SearchDnOrganizationalRoleService,
    private readonly searchDnOrganizationalUnitService: SearchDnOrganizationalUnitService,
    private readonly searchDnGroupService: SearchDnGroupService,
    private readonly searchDnUserService: SearchDnUserService,
    authorizeService: LdapAuthorizeService,
  ) {
    server.search(
      configService.getOrThrow(Config.LDAP_BASE_DN),
      authorizeService.handler.bind(authorizeService),
      this.handler.bind(this),
    )
  }

  @Span()
  async handler(req: LdapRequest, res, next) {
    try {
      this.logger.debug({ message: 'Searching DN', req: req.pojo })
      const org = this.searchDnOrganizationService.handler(req, res)
      const orgRole = this.searchDnOrganizationalRoleService.handler(req, res)
      const orgUnit = this.searchDnOrganizationalUnitService.handler(req, res)
      const [groups, users] = await Promise.all([
        this.searchDnGroupService.handler(req, res),
        this.searchDnUserService.handler(req, res),
      ])
      this.logger.log({
        message: `Sent ${users.length} users, ${groups.length} groups.`,
        org: org.map((el) => el.dn),
        orgRole: orgRole.map((el) => el.dn),
        orgUnit: orgUnit.map((el) => el.dn),
        groups: groups.map((el) => el.dn),
        users: users.map((el) => el.dn),
        req: req.pojo,
      })
    } catch (err) {
      this.logger.error({ message: err.message, req: req.pojo }, err)
      throw new OperationsError(err.message)
    } finally {
      res.end()
      return next()
    }
  }
}
