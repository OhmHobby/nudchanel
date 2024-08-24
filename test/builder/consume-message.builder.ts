import { ConsumeMessage, ConsumeMessageFields, MessageProperties } from 'amqplib'

export class ConsumeMessageBuilder {
  private readonly consumeMessage: ConsumeMessage = {
    fields: {
      consumerTag: '',
      deliveryTag: 0,
      redelivered: false,
      exchange: '',
      routingKey: '',
    } as ConsumeMessageFields,
    content: undefined,
    properties: {
      contentType: undefined,
      contentEncoding: undefined,
      headers: undefined,
      deliveryMode: undefined,
      priority: undefined,
      correlationId: undefined,
      replyTo: undefined,
      expiration: undefined,
      messageId: undefined,
      timestamp: new Date().getTime(),
      type: undefined,
      userId: undefined,
      appId: undefined,
      clusterId: undefined,
    } as MessageProperties,
  }

  constructor() {}

  withContent(content) {
    this.consumeMessage.content = content
    return this
  }

  withRoutingKey(routingKey) {
    this.consumeMessage.fields.routingKey = routingKey
    return this
  }

  build() {
    return this.consumeMessage
  }
}
