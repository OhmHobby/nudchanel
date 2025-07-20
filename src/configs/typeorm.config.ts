import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'
import { ProfileDiscordEntity } from 'src/entities/accounts/profile-discord.entity'
import { ProfileGitlabEntity } from 'src/entities/accounts/profile-gitlab.entity'
import { RefreshTokenEntity } from 'src/entities/accounts/refresh-token.entity'
import { UserLocalUserEntity } from 'src/entities/accounts/user-local-user.entity'
import { ApplicationSettingEntity } from 'src/entities/application-setting.entity'
import { AuditLogEntity } from 'src/entities/audit-log.entity'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { GalleryActivityEntity } from 'src/entities/gallery/gallery-activity.entity'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { GalleryTagEntity } from 'src/entities/gallery/gallery-tag.entity'
import { GalleryYouTubeVideoEntity } from 'src/entities/gallery/gallery-youtube-video.entity'
import { NudStudentEntity } from 'src/entities/nud-student/nud-student.entity'
import { ProfilePhotoEntity } from 'src/entities/profile/profile-photo.entity'
import { RecruitApplicantRoleEntity } from 'src/entities/recruit/recruit-applicant-role.entity'
import { RecruitApplicantEntity } from 'src/entities/recruit/recruit-applicant.entity'
import { RecruitFormAnswerEntity } from 'src/entities/recruit/recruit-form-answer.entity'
import { RecruitFormCollectionEntity } from 'src/entities/recruit/recruit-form-collection.entity'
import { RecruitFormQuestionEntity } from 'src/entities/recruit/recruit-form-question.entity'
import { RecruitInterviewSlotEntity } from 'src/entities/recruit/recruit-interview-slot.entity'
import { RecruitNoteEntity } from 'src/entities/recruit/recruit-note.entity'
import { RecruitRoleModeratorEntity } from 'src/entities/recruit/recruit-role-moderator.entity'
import { RecruitRoleEntity } from 'src/entities/recruit/recruit-role.entity'
import { RecruitSettingEntity } from 'src/entities/recruit/recruit-setting.entity'
import { RecruitSurveyEntity } from 'src/entities/recruit/recruit-survey.entity'
import { Config } from 'src/enums/config.enum'

@Injectable()
export class TypeormConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  static readonly entities = [
    GalleryActivityEntity,
    GalleryAlbumEntity,
    GalleryPhotoEntity,
    GalleryTagEntity,
    GalleryYouTubeVideoEntity,
    NudStudentEntity,
    ProfileDiscordEntity,
    ProfileGitlabEntity,
    ProfilePhotoEntity,
    RecruitApplicantEntity,
    RecruitApplicantRoleEntity,
    RecruitFormAnswerEntity,
    RecruitFormCollectionEntity,
    RecruitFormQuestionEntity,
    RecruitInterviewSlotEntity,
    RecruitNoteEntity,
    RecruitRoleEntity,
    RecruitRoleModeratorEntity,
    RecruitSettingEntity,
    RecruitSurveyEntity,
    RefreshTokenEntity,
    UserLocalUserEntity,
    AuditLogEntity,
    ApplicationSettingEntity,
    DataMigrationEntity,
  ]

  static readonly migrations = ['dist/migrations/*.js']

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get(Config.PG_HOST),
      port: this.configService.get(Config.PG_PORT),
      username: this.configService.get(Config.PG_USER),
      password: this.configService.get(Config.PG_PASS),
      database: this.configService.get(Config.PG_DB),
      entities: TypeormConfigService.entities,
      migrations: TypeormConfigService.migrations,
      migrationsRun: this.configService.get(Config.DB_MIGRATION),
      synchronize: false,
      logging: this.configService.get(Config.LOG_LEVEL) === 'debug',
    }
  }
}
