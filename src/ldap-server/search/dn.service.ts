import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OperationsError, Server } from 'ldapjs'
import { Span } from 'nestjs-otel'
import { Config } from 'src/enums/config.enum'
import { ServiceProvider } from 'src/enums/service-provider.enum'
import { LdapAuthorizeService } from '../authorize.service'
import { LdapMetricService } from '../metric.service'
import { LdapRequest } from '../types/ldap-request.type'
import { SearchDnGroupService } from './dn/group.service'
import { SearchDnOrganizationService } from './dn/organization.service'
import { SearchDnOrganizationalRoleService } from './dn/organizational-role.service'
import { SearchDnOrganizationalUnitService } from './dn/organizational-unit.service'
import { SearchDnUserService } from './dn/user.service'

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
    ldapMetricService: LdapMetricService,
  ) {
    server.search(
      configService.getOrThrow(Config.LDAP_BASE_DN),
      authorizeService.handler.bind(authorizeService),
      this.handler.bind(this),
      ldapMetricService.searchMetric.bind(ldapMetricService),
    )
  }

  @Span()
  async handler(req: LdapRequest, res, next) {
    this.logger.log({ message: 'Searching DN', req: req.json })
    try {
      const org = this.searchDnOrganizationService.handler(req, res)
      const orgRole = this.searchDnOrganizationalRoleService.handler(req, res)
      const orgUnit = this.searchDnOrganizationalUnitService.handler(req, res)
      const [groups, users] = await Promise.all([
        this.searchDnGroupService.handler(req, res),
        this.searchDnUserService.handler(req, res),
      ])
      this.logger.log({
        message: `Sent ${users.length} users, ${groups.length} groups.`,
        org: org.map((el) => el.dn.toString()),
        orgRole: orgRole.map((el) => el.dn.toString()),
        orgUnit: orgUnit.map((el) => el.dn.toString()),
        groups: groups.map((el) => el.dn.toString()),
        users: users.map((el) => el.dn.toString()),
        req: req.json,
      })
      res.end()
      return next()
    } catch (err) {
      this.logger.error({ message: err.message, req: req.json }, err)
      return next(new OperationsError())
    }
  }
}
