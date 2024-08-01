import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { Test, TestingModuleBuilder } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import { AmqpModule } from 'src/amqp/amqp.module'
import { AppModule } from 'src/app.module'
import { SwaggerConfigBuilder } from 'src/configs/swagger.config'
import { MockRabbitMQModule } from './mock-rabbitmq-module'
import { MockTypegooseModule } from './mock-typegoose-module'

export class AppBuilder {
  private readonly moduleFixture: TestingModuleBuilder

  constructor() {
    this.moduleFixture = Test.createTestingModule({
      imports: [AppModule],
    })
  }

  withDefaultMockModules() {
    this.moduleFixture
      .overrideModule(TypegooseModule)
      .useModule(MockTypegooseModule)
      .overrideModule(AmqpModule)
      .useModule(MockRabbitMQModule)
    return this
  }

  async build() {
    const moduleFixture = await this.moduleFixture.compile()
    const app = moduleFixture.createNestApplication()
    app.use(cookieParser())
    app.enableVersioning({
      prefix: 'api/v',
      type: VersioningType.URI,
    })
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    await app.get(SwaggerConfigBuilder).build(app)
    await app.init()
    return app
  }
}
