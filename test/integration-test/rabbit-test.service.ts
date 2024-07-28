import { AmqpConnection, AmqpConnectionManager, RabbitRPC } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'

@Injectable()
export class RabbitTestService {
  static Message = 'integration_test'

  private readonly amqpConnection: AmqpConnection

  haveBeenCalled: number

  constructor(amqpConnectionManager: AmqpConnectionManager) {
    this.amqpConnection = amqpConnectionManager.getConnection('default')!
    this.haveBeenCalled = 0
  }

  publish() {
    return this.amqpConnection.publish(RabbitTestService.Message, RabbitTestService.Message, RabbitTestService.Message)
  }

  @RabbitRPC({
    exchange: RabbitTestService.Message,
    routingKey: RabbitTestService.Message,
    queue: RabbitTestService.Message,
  })
  rpc() {
    this.haveBeenCalled++
  }
}
