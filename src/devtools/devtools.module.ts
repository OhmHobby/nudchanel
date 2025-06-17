import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ApplicationSettingEntity } from 'src/entities/application-setting.entity'
import { ApplicationSettingService } from 'src/application-setting/application-setting.service'
import { DevtoolsController } from './devtools.controller'
import { DevtoolsService } from './devtools.service'

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationSettingEntity])],
  controllers: [DevtoolsController],
  providers: [DevtoolsService, ApplicationSettingService],
  exports: [DevtoolsService],
})
export class DevtoolsModule {}
