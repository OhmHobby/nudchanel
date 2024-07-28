import { ModuleConfigFactory } from '@golevelup/nestjs-modules'
import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/enums/config.enum'
import { RabbitExchange } from 'src/enums/rabbit-exchange.enum'

@Injectable()
export class RabbitMQConfigService implements ModuleConfigFactory<RabbitMQConfig> {
  constructor(private readonly configService: ConfigService) {}

  createModuleConfig(): RabbitMQConfig {
    return {
      exchanges: [
        {
          name: RabbitExchange.AccountsEvent,
          type: 'topic',
        },
      ],
      uri: this.configService.get(Config.RABBITMQ_URI)!,
      connectionInitOptions: {
        wait: this.configService.get<boolean>(Config.RABBITMQ_WAIT_ENABLED),
        timeout: +this.configService.get(Config.RABBITMQ_WAIT_TIMEOUT),
      },
    }
  }
}
