import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { Module } from '@nestjs/common'
import { RabbitMQConfigService } from 'src/configs/rabbitmq.config'
import { AmqpService } from './amqp.service'

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useClass: RabbitMQConfigService,
    }),
  ],
  providers: [AmqpService],
  exports: [AmqpService],
})
export class AmqpModule {}
