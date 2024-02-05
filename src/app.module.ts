import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { WinstonModule } from 'nest-winston'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { configuration } from './configs/configuration'
import { WinstonConfig } from './configs/winston.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => configuration],
    }),
    WinstonModule.forRootAsync({
      useClass: WinstonConfig,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
