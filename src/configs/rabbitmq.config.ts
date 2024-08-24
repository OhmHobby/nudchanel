import { ModuleConfigFactory } from '@golevelup/nestjs-modules'
import { RabbitMQConfig, RabbitMQExchangeConfig } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/enums/config.enum'
import { RabbitChannel } from 'src/enums/rabbit-channel.enum'
import { RabbitExchange } from 'src/enums/rabbit-exchange.enum'

@Injectable()
export class RabbitMQConfigService implements ModuleConfigFactory<RabbitMQConfig> {
  protected exchanges: RabbitMQExchangeConfig[] = [
    { name: RabbitExchange.AccountsEvent, type: 'topic' },
    { name: RabbitExchange.DiscordBot, type: 'topic' },
    { name: RabbitExchange.PhotoProcessor, type: 'topic' },
    { name: RabbitExchange.PhotoProcessorDlx, type: 'topic', options: { internal: true } },
  ]

  constructor(private readonly configService: ConfigService) {}

  createModuleConfig(): RabbitMQConfig {
    return {
      exchanges: this.exchanges,
      uri: this.configService.get(Config.RABBITMQ_URI)!,
      connectionInitOptions: {
        wait: this.configService.get<boolean>(Config.RABBITMQ_WAIT_ENABLED),
        timeout: +this.configService.get(Config.RABBITMQ_WAIT_TIMEOUT),
      },
      channels: {
        [RabbitChannel.Default]: {
          prefetchCount: 10,
          default: true,
        },
        [RabbitChannel.Process]: {
          prefetchCount: 1,
          default: false,
        },
      },
    }
  }
}
