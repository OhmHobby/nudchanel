import otelSDK from './tracing'

import { ClassSerializerInterceptor, Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { useContainer } from 'class-validator'
import config from 'config'
import cookieParser from 'cookie-parser'
import { Server } from 'ldapjs'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { AppModule } from './app.module'
import { SwaggerConfigBuilder } from './configs/swagger.config'
import { Config } from './enums/config.enum'
import { ServiceProvider } from './enums/service-provider.enum'

const LOG_CONTEXT = 'Bootstrap'

async function bootstrapServer() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: config.get<boolean>(Config.LOG_BUFFER),
    forceCloseConnections: true,
  })
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

async function bootstrap() {
  if (config.get<boolean>(Config.OTLP_ENABLED)) {
    await otelSDK.start()
  }
  await bootstrapServer()
}
bootstrap()
