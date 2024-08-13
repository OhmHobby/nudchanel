import { ClassSerializerInterceptor, Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import config from 'config'
import cookieParser from 'cookie-parser'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { AppModule } from './app.module'
import { SwaggerConfigBuilder } from './configs/swagger.config'
import { AppRunMode } from './enums/app-run-mode.enum'
import { Config } from './enums/config.enum'
import { SchedulerRegisterService } from './scheduler/scheduler-register.service'
import otelSDK from './tracing'
import { WorkerModule } from './worker.module'

async function bootstrapServer() {
  if (config.get<boolean>(Config.OTLP_ENABLED)) {
    await otelSDK.start()
  }
  const app = await NestFactory.create(AppModule, { bufferLogs: config.get<boolean>(Config.LOG_BUFFER) })
  app.enableVersioning({ prefix: 'api/v', type: VersioningType.URI })
  const logger = app.get<Logger>(WINSTON_MODULE_NEST_PROVIDER)
  app.useLogger(logger)
  app.enableShutdownHooks()
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  await app.get(SwaggerConfigBuilder).build(app)
  app.getHttpAdapter().getInstance().disable('x-powered-by')
  await app.listen(config.get<number>(Config.HTTP_PORT))
  logger.log(`Server listening on ${await app.getUrl()}`, 'Bootstrap')
}

async function bootstrapWorker(portConfigName: string) {
  const app = await NestFactory.create(WorkerModule, { bufferLogs: config.get<boolean>(Config.LOG_BUFFER) })
  const logger = app.get<Logger>(WINSTON_MODULE_NEST_PROVIDER)
  app.useLogger(logger)
  app.enableShutdownHooks()
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  await app.get(SchedulerRegisterService).register()
  await app.get(SwaggerConfigBuilder).build(app)
  await app.listen(config.get<number>(portConfigName))
  logger.log(`Worker listening on ${await app.getUrl()}`, 'Bootstrap')
}

async function bootstrap() {
  const runMode = config.get<string>(Config.RUN_MODE)
  switch (runMode) {
    case AppRunMode.AllInOne:
      await Promise.all([bootstrapServer(), bootstrapWorker(Config.HTTP_SECONDARY_PORT)])
      break
    case AppRunMode.Server:
      await bootstrapServer()
      break
    case AppRunMode.Worker:
      await bootstrapWorker(Config.HTTP_PORT)
      break
    default:
      throw new Error(`Unknown runMode ${runMode}`)
  }
}
bootstrap()
