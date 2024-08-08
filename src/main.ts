import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import config from 'config'
import cookieParser from 'cookie-parser'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { AppModule } from './app.module'
import { SwaggerConfigBuilder } from './configs/swagger.config'
import { Config } from './enums/config.enum'
import { SchedulerRegisterService } from './scheduler/scheduler-register.service'
import otelSDK from './tracing'

async function bootstrap() {
  await otelSDK.start()
  const app = await NestFactory.create(AppModule, { bufferLogs: config.get<boolean>(Config.LOG_BUFFER) })
  app.enableVersioning({ prefix: 'api/v', type: VersioningType.URI })
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
  app.enableShutdownHooks()
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  await app.get(SchedulerRegisterService).register()
  await app.get(SwaggerConfigBuilder).build(app)
  app.getHttpAdapter().getInstance().disable('x-powered-by')
  await app.listen(config.get<number>(Config.HTTP_PORT))
}
bootstrap()
