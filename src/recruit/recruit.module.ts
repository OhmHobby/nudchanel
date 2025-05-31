import { MiddlewareConsumer, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountsModule } from 'src/accounts/accounts.module'
import { RecruitApplicantRoleEntity } from 'src/entities/recruit/recruit-applicant-role.entity'
import { RecruitApplicantEntity } from 'src/entities/recruit/recruit-applicant.entity'
import { RecruitFormCollectionEntity } from 'src/entities/recruit/recruit-form-collection.entity'
import { RecruitFormQuestionEntity } from 'src/entities/recruit/recruit-form-question.entity'
import { RecruitRoleModeratorEntity } from 'src/entities/recruit/recruit-role-moderator.entity'
import { RecruitRoleEntity } from 'src/entities/recruit/recruit-role.entity'
import { RecruitSettingEntity } from 'src/entities/recruit/recruit-setting.entity'
import { RecruitApplicantService } from './applicant/recruit-applicant.service'
import { RecruitApplicantV1Controller } from './applicant/recruit-applicant.v1.controller'
import { RecruitContextMiddleware } from './context/recruit-context.middleware'
import { RecruitFormService } from './form/recruit-form.service'
import { RecruitFormV1Controller } from './form/recruit-form.v1.controller'
import { RecruitModeratorService } from './moderator/recruit-moderator.service'
import { RecruitModeratorV1Controller } from './moderator/recruit-moderator.v1.controller'
import { RecruitV1Controller } from './recruit.v1.controller'
import { RecruitRoleService } from './role/recruit-role.service'
import { RecruitRoleV1Controller } from './role/recruit-role.v1.controller'
import { RecruitSettingService } from './setting/recruit-setting.service'
import { RecruitSettingV1Controller } from './setting/recruit-setting.v1.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecruitApplicantEntity,
      RecruitFormCollectionEntity,
      RecruitFormQuestionEntity,
      RecruitSettingEntity,
      RecruitRoleModeratorEntity,
      RecruitRoleEntity,
      RecruitApplicantRoleEntity,
    ]),
    AccountsModule,
  ],
  controllers: [
    RecruitV1Controller,
    RecruitApplicantV1Controller,
    RecruitFormV1Controller,
    RecruitRoleV1Controller,
    RecruitModeratorV1Controller,
    RecruitSettingV1Controller,
  ],
  providers: [
    RecruitSettingService,
    RecruitApplicantService,
    RecruitFormService,
    RecruitRoleService,
    RecruitModeratorService,
  ],
})
export class RecruitModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RecruitContextMiddleware)
      .forRoutes(
        RecruitV1Controller,
        RecruitApplicantV1Controller,
        RecruitFormV1Controller,
        RecruitRoleV1Controller,
        RecruitSettingV1Controller,
      )
  }
}
