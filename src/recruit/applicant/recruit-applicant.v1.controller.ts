import { Controller, Get, NotFoundException, Param, Post } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { User } from '@nudchannel/auth'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { UserCtx } from 'src/auth/user.decorator'
import { RECRUIT_SETTING_ID } from 'src/constants/headers.constants'
import { UuidParamDto } from 'src/gallery/dto/uuid-param.dto'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { RecruitCtx } from '../context/recruit-context.decorator'
import { RecruitContext } from '../context/recruit-context.model'
import { RecruitApplicantModel } from '../models/recruit-applicant.model'
import { RecruitModeratorService } from '../moderator/recruit-moderator.service'
import { RecruitApplicantService } from './recruit-applicant.service'

@Controller({ path: 'recruit/applicants', version: '1' })
@ApiTags('RecruitApplicantV1')
export class RecruitApplicantV1Controller {
  constructor(
    private readonly recruitApplicantService: RecruitApplicantService,
    private readonly recruitModeratorService: RecruitModeratorService,
  ) {}

  @Get()
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiOperation({ summary: 'List applicants' })
  @ApiOkResponse({ type: RecruitApplicantModel, isArray: true })
  @ApiForbiddenResponse()
  async getRecruitApplicants(@RecruitCtx() ctx: RecruitContext): Promise<RecruitApplicantModel[]> {
    ctx.hasPermissionOrThrow(ctx.currentSettingId)
    return await this.recruitApplicantService.getRecruitApplicantModels(undefined, ctx.currentSettingId, undefined)
  }

  @Post()
  @AuthGroups()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiOperation({ summary: 'Create applicant', description: 'Create applicant data when TC accepted' })
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
  @ApiOperation({ summary: `Get current user's applicant info` })
  @ApiOkResponse({ type: RecruitApplicantModel })
  @ApiForbiddenResponse({ description: 'No registration found' })
  async getMyRecruitApplicantInfo(@RecruitCtx() ctx: RecruitContext): Promise<RecruitApplicantModel> {
    return await this.recruitApplicantService.getRecruitApplicantModelWithInfo(ctx.applicantOrThrow)
  }

  @Get(':id')
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get applicant info by applicant id' })
  @ApiOkResponse({ type: RecruitApplicantModel })
  @ApiForbiddenResponse({ description: 'No permission to view applicant' })
  async getRecruitApplicantInfo(@Param() { id }: UuidParamDto, @UserCtx() user: User): Promise<RecruitApplicantModel> {
    await this.recruitModeratorService.hasPermissionToApplicantOrThrow(ObjectIdUuidConverter.toUuid(user.id!), id)
    const applicant = await this.recruitApplicantService.findOne(id)
    if (!applicant) throw new NotFoundException()
    return await this.recruitApplicantService.getRecruitApplicantModelWithInfo(applicant)
  }
}
