import { Controller, ForbiddenException, Get, NotFoundException, Param, Post } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger'
import { User } from '@nudchannel/auth'
import { ProfileIdModel } from 'src/accounts/models/profile-id.model'
import { ProfileNameService } from 'src/accounts/profile/profile-name.service'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { UserCtx } from 'src/auth/user.decorator'
import { RECRUIT_SETTING_ID } from 'src/constants/headers.constants'
import { UuidParamDto } from 'src/gallery/dto/uuid-param.dto'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { RecruitCtx } from '../context/recruit-context.decorator'
import { RecruitContext } from '../context/recruit-context.model'
import { RecruitFormService } from '../form/recruit-form.service'
import { RecruitApplicantModel } from '../models/recruit-applicant.model'
import { RecruitModeratorService } from '../moderator/recruit-moderator.service'
import { RecruitApplicantService } from './recruit-applicant.service'

@Controller({ path: 'recruit/applicants', version: '1' })
@ApiTags('RecruitApplicantV1')
export class RecruitApplicantV1Controller {
  constructor(
    private readonly recruitApplicantService: RecruitApplicantService,
    private readonly recruitModeratorService: RecruitModeratorService,
    private readonly recruitFormService: RecruitFormService,
    private readonly profileNameService: ProfileNameService,
  ) {}

  @Get()
  @AuthGroups()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiOkResponse({ type: RecruitApplicantModel, isArray: true })
  async getRecruitApplicants(@RecruitCtx() ctx: RecruitContext): Promise<RecruitApplicantModel[]> {
    const applicants = await this.recruitApplicantService.find(undefined, ctx.currentSettingId, undefined)
    const profileNameMap = await this.profileNameService.getProfilesNameMap(
      applicants.map((el) => ObjectIdUuidConverter.toObjectId(el.profileId)),
      'th',
    )
    return applicants.map((applicant) => RecruitApplicantModel.fromEntity(applicant, profileNameMap))
  }

  @Post()
  @AuthGroups()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiOkResponse({ type: RecruitApplicantModel })
  @ApiConflictResponse({ description: 'Already created' })
  async createRecruitApplicant(
    @UserCtx() user: User,
    @RecruitCtx() ctx: RecruitContext,
  ): Promise<RecruitApplicantModel> {
    const applicant = await this.recruitApplicantService.createApplicant(
      ctx.currentSettingId,
      ObjectIdUuidConverter.toUuid(user.id!),
    )
    return RecruitApplicantModel.fromEntity(applicant)
  }

  @Get('me')
  @AuthGroups()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiOkResponse({ type: RecruitApplicantModel })
  @ApiForbiddenResponse({ description: 'No registration found' })
  async getMyRecruitApplicantInfo(
    @UserCtx() user: User,
    @RecruitCtx() ctx: RecruitContext,
  ): Promise<RecruitApplicantModel> {
    const profileId = ProfileIdModel.fromObjectId(user.id!)
    const profileNameMapP = this.profileNameService.getProfilesNameMap([profileId.objectId], 'th')
    const applicant = await this.recruitApplicantService.findOne(undefined, ctx.currentSettingId, profileId.uuid)
    if (!applicant) throw new ForbiddenException()
    const [completionMap, profileNameMap] = await Promise.all([
      this.recruitFormService.getCompletionMap(
        applicant.id,
        applicant.roles?.map((role) => role.role?.collectionId).filter((el) => typeof el === 'string'),
      ),
      profileNameMapP,
    ])
    return RecruitApplicantModel.fromEntity(applicant, profileNameMap, completionMap)
  }

  @Get(':id')
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOkResponse({ type: RecruitApplicantModel })
  async getRecruitApplicantInfo(@Param() { id }: UuidParamDto, @UserCtx() user: User): Promise<RecruitApplicantModel> {
    await this.recruitModeratorService.hasPermissionToApplicantOrThrow(ObjectIdUuidConverter.toUuid(user.id!), id)
    const applicant = await this.recruitApplicantService.findOne(id)
    if (!applicant) throw new NotFoundException()
    const [completionMap, profileNameMap] = await Promise.all([
      this.recruitFormService.getCompletionMap(
        applicant.id,
        applicant.roles?.map((role) => role.role?.collectionId).filter((el) => typeof el === 'string'),
      ),
      this.profileNameService.getProfilesNameMap([ObjectIdUuidConverter.toObjectId(applicant.profileId)], 'th'),
    ])
    return RecruitApplicantModel.fromEntity(applicant, profileNameMap, completionMap)
  }
}
