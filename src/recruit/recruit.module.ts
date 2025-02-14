import { MiddlewareConsumer, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RecruitRoleModeratorEntity } from 'src/entities/recruit/recruit-role-moderator.entity'
import { RecruitSettingEntity } from 'src/entities/recruit/recruit-setting.entity'
import { RecruitContextMiddleware } from './context/recruit-context.middleware'
import { RecruitModeratorService } from './moderator/recruit-moderator.service'
import { RecruitV1Controller } from './recruit.v1.controller'
import { RecruitSettingService } from './setting/recruit-setting.service'
import { RecruitSettingV1Controller } from './setting/recruit-setting.v1.controller'

@Module({
  imports: [TypeOrmModule.forFeature([RecruitSettingEntity, RecruitRoleModeratorEntity])],
  controllers: [RecruitV1Controller, RecruitSettingV1Controller],
  providers: [RecruitSettingService, RecruitModeratorService],
})
export class RecruitModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RecruitContextMiddleware).forRoutes(RecruitV1Controller, RecruitSettingV1Controller)
  }
}
