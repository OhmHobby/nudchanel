import { RabbitMQConfigService } from 'src/configs/rabbitmq.config'
import { RabbitTestService } from './rabbit-test.service'

export class RabbitTestConfigService extends RabbitMQConfigService {
  protected exchanges = [{ name: RabbitTestService.Message, type: 'topic' }]
}
