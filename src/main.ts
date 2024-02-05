import { NestFactory } from '@nestjs/core'
import * as config from 'config'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { AppModule } from './app.module'
import { Config } from './enums/config.enum'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: config.get<boolean>(Config.LOG_BUFFER) })
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
  await app.listen(config.get<number>(Config.HTTP_PORT))
}
bootstrap()
