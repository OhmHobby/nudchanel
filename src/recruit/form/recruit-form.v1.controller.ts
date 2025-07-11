import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
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
import { CreateRecruitFormCollectionDto } from '../dto/create-recruit-form-collection.dto'
import { CreateRecruitFormQuestionDto } from '../dto/create-recruit-form-question.dto'
import { GetRecruitFormCollectionDto } from '../dto/get-recruit-form-collection.dto'
import { UpdateRecruitFormCollectionDto } from '../dto/update-recruit-form-collection.dto'
import { UpdateRecruitFormQuestionDto } from '../dto/update-recruit-form-question.dto'
import { RecruitFormCollectionModel } from '../models/recruit-form-collection.model'
import { RecruitFormQuestionModel } from '../models/recruit-form-question.model'
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
    applicantId = applicantId ?? (user.isAuthorized('nudch') ? (ctx.applicantId ?? undefined) : ctx.applicantIdOrThrow)
    const [[collection], questions] = await Promise.all([
      applicantId
        ? this.recruitFormService.getApplicantFormCollectionWithCompletions(applicantId, ctx.currentSettingId, [id])
        : this.recruitFormService
            .getCollections([id])
            .then((collections) => collections.map((collection) => RecruitFormCollectionModel.fromEntity(collection))),
      this.recruitFormService.getQAByCollectionId(id, applicantId),
    ])
    if (!collection) throw new NotFoundException()
    return collection.withQuestions(questions)
  }

  @Get('collections')
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiOperation({ summary: 'List form collections for current recruit' })
  @ApiOkResponse({ type: [RecruitFormCollectionModel] })
  async getRecruitFormCollections(@RecruitCtx() ctx: RecruitContext): Promise<RecruitFormCollectionModel[]> {
    ctx.hasPermissionOrThrow()
    const collections = await this.recruitFormService.getCollectionsByRecruitId(ctx.currentSettingId)
    return collections.map((collection) => RecruitFormCollectionModel.fromEntity(collection))
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
    ctx.isRegistrationOpenOrThrow()
    await this.recruitFormService.updateFormAnswers(ctx.applicantOrThrow, body.items)
  }

  @Post('collections')
  @AuthGroups('pr')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new form collection' })
  @ApiOkResponse({ type: RecruitFormCollectionModel })
  async createRecruitFormCollection(@Body() body: CreateRecruitFormCollectionDto): Promise<RecruitFormCollectionModel> {
    const collection = await this.recruitFormService.createCollection(body)
    return RecruitFormCollectionModel.fromEntity(collection)
  }

  @Put('collections/:id')
  @AuthGroups('pr')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update a form collection' })
  @ApiOkResponse({ type: RecruitFormCollectionModel })
  async updateRecruitFormCollection(
    @Param() { id }: UuidParamDto,
    @Body() body: UpdateRecruitFormCollectionDto,
  ): Promise<RecruitFormCollectionModel> {
    const collection = await this.recruitFormService.updateCollection(id, body)
    return RecruitFormCollectionModel.fromEntity(collection)
  }

  @Post('questions')
  @HttpCode(HttpStatus.CREATED)
  @AuthGroups('pr')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new form question' })
  @ApiCreatedResponse({ type: RecruitFormQuestionModel })
  async createRecruitFormQuestion(
    @Body() body: CreateRecruitFormQuestionDto,
    @RecruitCtx() ctx: RecruitContext,
  ): Promise<RecruitFormQuestionModel> {
    ctx.hasPermissionOrThrow()
    const question = await this.recruitFormService.createQuestion(body)
    return RecruitFormQuestionModel.fromEntity(question)
  }

  @Put('questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuthGroups('pr')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update a form question' })
  @ApiNoContentResponse()
  async updateRecruitFormQuestion(
    @Param() { id }: UuidParamDto,
    @Body() body: UpdateRecruitFormQuestionDto,
    @RecruitCtx() ctx: RecruitContext,
  ): Promise<void> {
    ctx.hasPermissionOrThrow()
    await this.recruitFormService.updateQuestion(id, body)
  }
}
