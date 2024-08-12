import { AmqpConnection, AmqpConnectionManager } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { Options } from 'amqplib'
import { RabbitExchange } from 'src/enums/rabbit-exchange.enum'

@Injectable()
export class AmqpService {
  readonly amqpConnection?: AmqpConnection

  constructor(amqpConnectionManager: AmqpConnectionManager) {
    this.amqpConnection = amqpConnectionManager.getConnection('default')
  }

  publish<T>(exchange: RabbitExchange, routingKey: string, message: T, options?: Options.publish) {
    if (!this.amqpConnection) throw new Error('No amqp connection')
    return this.amqpConnection.publish(exchange, routingKey, message, options)
  }
}
