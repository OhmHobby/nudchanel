import otelSDK from './tracing'

import { ClassSerializerInterceptor, Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { useContainer } from 'class-validator'
import config from 'config'
import cookieParser from 'cookie-parser'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { AppModule } from './app.module'
import { SwaggerConfigBuilder } from './configs/swagger.config'
import { AppRunMode } from './enums/app-run-mode.enum'
import { Config } from './enums/config.enum'
import { SchedulerRegisterService } from './scheduler/scheduler-register.service'
import { WorkerModule } from './worker.module'
import { ServiceProvider } from './enums/service-provider.enum'
import { Server } from 'ldapjs'

const LOG_CONTEXT = 'Bootstrap'

async function bootstrapServer() {
  const app = await NestFactory.create(AppModule, { bufferLogs: config.get<boolean>(Config.LOG_BUFFER) })
  app.enableVersioning({ prefix: 'api/v', type: VersioningType.URI })
  const logger = app.get<Logger>(WINSTON_MODULE_NEST_PROVIDER)
  app.useLogger(logger)
  app.enableShutdownHooks()
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  useContainer(app.select(AppModule), { fallbackOnErrors: true })
  await app.get(SwaggerConfigBuilder).build(app)
  app.getHttpAdapter().getInstance().disable('x-powered-by')
  if (config.get<boolean>(Config.LDAP_ENABLED)) {
    const ldapServer = app.get<Server>(ServiceProvider.LDAP_SERVER)
    ldapServer.listen(config.get<number>(Config.LDAP_PORT), '0.0.0.0', () =>
      logger.log(`LDAP server listening on ${ldapServer.url}`, LOG_CONTEXT),
    )
  }
  await app.listen(config.get<number>(Config.HTTP_PORT))
  logger.log(`Server listening on ${await app.getUrl()}`, LOG_CONTEXT)
}

async function bootstrapWorker(portConfigName: string) {
  const app = await NestFactory.create(WorkerModule, { bufferLogs: config.get<boolean>(Config.LOG_BUFFER) })
  const logger = app.get<Logger>(WINSTON_MODULE_NEST_PROVIDER)
  app.useLogger(logger)
  app.enableShutdownHooks()
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  useContainer(app.select(WorkerModule), { fallbackOnErrors: true })
  await app.get(SchedulerRegisterService).register()
  await app.get(SwaggerConfigBuilder).build(app)
  app.getHttpAdapter().getInstance().disable('x-powered-by')
  await app.listen(config.get<number>(portConfigName))
  logger.log(`Worker listening on ${await app.getUrl()}`, LOG_CONTEXT)
}

async function bootstrap() {
  if (config.get<boolean>(Config.OTLP_ENABLED)) {
    await otelSDK.start()
  }
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
