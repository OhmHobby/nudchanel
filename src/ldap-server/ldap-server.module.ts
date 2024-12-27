import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { Logger, Module } from '@nestjs/common'
import { createServer } from 'ldapjs'
import { AccountsModule } from 'src/accounts/accounts.module'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { ServiceProvider } from 'src/enums/service-provider.enum'
import { GroupModel } from 'src/models/accounts/group.model'
import { UserLocalModel } from 'src/models/accounts/user-local.model'
import { LdapAuthorizeService } from './authorize.service'
import { BindDnService } from './bind/bind-dn.service'
import { BindRootService } from './bind/bind-root.service'
import { LdapServerLifecyclesService } from './ldap-server.life-cycles.service'
import { LdapMetricService } from './metric.service'
import { SearchBaseService } from './search/base.service'
import { SearchDnService } from './search/dn.service'
import { SearchDnGroupService } from './search/dn/group.service'
import { SearchDnOrganizationService } from './search/dn/organization.service'
import { SearchDnOrganizationalRoleService } from './search/dn/organizational-role.service'
import { SearchDnOrganizationalUnitService } from './search/dn/organizational-unit.service'
import { SearchDnUserService } from './search/dn/user.service'
import { SearchSubschemaService } from './search/subschema.service'

@Module({
  imports: [TypegooseModule.forFeature([GroupModel, UserLocalModel], MongoConnection.Accounts), AccountsModule],
  providers: [
    LdapServerLifecyclesService,
    LdapMetricService,
    BindRootService,
    BindDnService,
    LdapAuthorizeService,
    SearchBaseService,
    SearchSubschemaService,
    SearchDnService,
    SearchDnOrganizationService,
    SearchDnOrganizationalRoleService,
    SearchDnOrganizationalUnitService,
    SearchDnGroupService,
    SearchDnUserService,
    {
      provide: ServiceProvider.LDAP_SERVER,
      useFactory: () => {
        const logger = new Logger('LdapServer')
        return createServer({
          log: {
            trace: (...args) => logger.debug(args),
            debug: (...args) => logger.debug(args),
            info: (...args) => logger.log(args),
            warn: (...args) => logger.warn(args),
            error: (...args) => logger.error(args),
            fatal: (...args) => logger.error(args),
          },
        })
      },
    },
  ],
})
export class LdapServerModule {}
