import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Query } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNoContentResponse,
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
import { AnswerRecruitFormQuestionsDto } from '../dto/answer-recruit-form-questions.dto'
import { GetRecruitFormCollectionDto } from '../dto/get-recruit-form-collection.dto'
import { RecruitFormCollectionModel } from '../models/recruit-form-collection.model'
import { RecruitModeratorService } from '../moderator/recruit-moderator.service'
import { RecruitFormService } from './recruit-form.service'

@Controller({ path: 'recruit/forms', version: '1' })
@ApiTags('RecruitFormV1')
export class RecruitFormV1Controller {
  constructor(
    private readonly recruitModeratorService: RecruitModeratorService,
    private readonly recruitFormService: RecruitFormService,
  ) {}

  @Get('collections/:id')
  @AuthGroups()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiOperation({ summary: 'Get form questions (and answers) by collection id' })
  @ApiOkResponse({ type: RecruitFormCollectionModel })
  @ApiForbiddenResponse({ description: 'Has not yet registered or no permission to view the applicant' })
  async getRecruitFormCollection(
    @Param() { id }: UuidParamDto,
    @Query() { applicantId }: GetRecruitFormCollectionDto,
    @UserCtx() user: User,
    @RecruitCtx() ctx: RecruitContext,
  ): Promise<RecruitFormCollectionModel> {
    const profileUid = ObjectIdUuidConverter.toUuid(user.id!)
    await this.recruitModeratorService.hasPermissionToApplicantOrThrow(profileUid, applicantId)
    applicantId = applicantId ?? ctx.applicantIdOrThrow
    const [[collection], questions] = await Promise.all([
      this.recruitFormService.getApplicantFormCollectionWithCompletions(applicantId, ctx.currentSettingId, [id]),
      this.recruitFormService.getQAByCollectionId(id, applicantId),
    ])
    if (!collection) throw new NotFoundException()
    return collection.withQuestions(questions)
  }

  @Patch('answers')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuthGroups()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: `Update applicant's answers` })
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiNoContentResponse()
  async answerRecruitFormQuestions(
    @Body() body: AnswerRecruitFormQuestionsDto,
    @RecruitCtx() ctx: RecruitContext,
  ): Promise<void> {
    await this.recruitFormService.updateFormAnswers(ctx.applicantIdOrThrow, body.items)
  }
}
