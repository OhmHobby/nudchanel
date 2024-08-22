import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, TestingModuleBuilder } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import { OpenTelemetryModule } from 'nestjs-otel'
import { AmqpModule } from 'src/amqp/amqp.module'
import { AppModule } from 'src/app.module'
import { SwaggerConfigBuilder } from 'src/configs/swagger.config'
import { MockOpenTelemetryModule } from './mock-opentelemetry-module'
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
      .overrideModule(OpenTelemetryModule)
      .useModule(MockOpenTelemetryModule)
    return this
  }

  async build() {
    const moduleFixture = await this.moduleFixture.compile()
    const app = moduleFixture.createNestApplication()
    app.use(cookieParser())
    app.enableVersioning({ prefix: 'api/v', type: VersioningType.URI })
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
    await app.get(SwaggerConfigBuilder).build(app)
    await app.init()
    return app
  }
}
