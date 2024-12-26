import { Inject, Injectable, Logger, OnApplicationShutdown } from '@nestjs/common'
import { Server } from 'ldapjs'
import { ServiceProvider } from 'src/enums/service-provider.enum'

@Injectable()
export class LdapServerLifecyclesService implements OnApplicationShutdown {
  private readonly logger = new Logger(LdapServerLifecyclesService.name)

  constructor(
    @Inject(ServiceProvider.LDAP_SERVER)
    private readonly server: Server,
  ) {}

  onApplicationShutdown(signal?: string) {
    return new Promise<void>((resolve) => {
      this.logger.warn({ message: 'Shutting down ldap-server', signal })
      this.server.close(() => {
        this.logger.log('Successfully shut down ldap-server')
        resolve()
      })
    })
  }
}
