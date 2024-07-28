import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { Module } from '@nestjs/common'
import { RabbitMQConfigService } from 'src/configs/rabbitmq.config'

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useClass: RabbitMQConfigService,
    }),
  ],
  providers: [],
  exports: [],
})
export class AmqpModule {}
