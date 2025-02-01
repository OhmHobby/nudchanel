import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ApplicationSettingEntity } from 'src/entities/application-setting.entity'
import { ApplicationSettingService } from './application-setting.service'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ApplicationSettingEntity])],
  providers: [ApplicationSettingService],
  exports: [ApplicationSettingService],
})
export class ApplicationSettingModule {}
