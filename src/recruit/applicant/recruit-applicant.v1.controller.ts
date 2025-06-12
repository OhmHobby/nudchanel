import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiConflictResponse,
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
import { RecruitNoteBodyDto } from '../dto/recruit-note-body.dto'
import { RecruitNoteParamDto } from '../dto/recruit-note-param.dto'
import { RecruitApplicantNoteModel } from '../models/recruit-applicant-note.model'
import { RecruitApplicantNotesModel } from '../models/recruit-applicant-notes.model'
import { RecruitApplicantModel } from '../models/recruit-applicant.model'
import { RecruitApplicantsModel } from '../models/recruit-applicants.model'
import { RecruitModeratorService } from '../moderator/recruit-moderator.service'
import { RecruitNoteService } from '../note/recruit-note.service'
import { RecruitApplicantService } from './recruit-applicant.service'

@Controller({ path: 'recruit/applicants', version: '1' })
@ApiTags('RecruitApplicantV1')
export class RecruitApplicantV1Controller {
  constructor(
    private readonly recruitApplicantService: RecruitApplicantService,
    private readonly recruitModeratorService: RecruitModeratorService,
    private readonly recruitNoteService: RecruitNoteService,
  ) {}

  @Get()
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiOperation({ summary: 'List applicants' })
  @ApiOkResponse({ type: RecruitApplicantsModel })
  @ApiForbiddenResponse()
  async getRecruitApplicants(@RecruitCtx() ctx: RecruitContext): Promise<RecruitApplicantsModel> {
    ctx.hasPermissionOrThrow(ctx.currentSettingId)
    const applicants = await this.recruitApplicantService.getRecruitApplicantModels(
      undefined,
      ctx.currentSettingId,
      undefined,
      ctx.currentSetting.isAnnounced() || ctx.isModerator,
    )
    return new RecruitApplicantsModel({ applicants })
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
  async getRecruitApplicantInfo(
    @Param() { id }: UuidParamDto,
    @RecruitCtx() ctx: RecruitContext,
    @UserCtx() user: User,
  ): Promise<RecruitApplicantModel> {
    await this.recruitModeratorService.hasPermissionToApplicantOrThrow(ObjectIdUuidConverter.toUuid(user.id!), id)
    const applicant = await this.recruitApplicantService.findOne(
      id,
      undefined,
      undefined,
      ctx.currentSetting.isAnnounced() || ctx.isModerator,
    )
    if (!applicant) throw new NotFoundException()
    return await this.recruitApplicantService.getRecruitApplicantModelWithInfo(applicant)
  }

  @Get(':id/notes')
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: `Get applicant's notes` })
  @ApiOkResponse({ type: RecruitApplicantNotesModel })
  @ApiForbiddenResponse({ description: 'No permission to view applicant' })
  async getRecruitApplicantNotes(
    @Param() { id }: UuidParamDto,
    @UserCtx() user: User,
  ): Promise<RecruitApplicantNotesModel> {
    const profileUid = ObjectIdUuidConverter.toUuid(user.id!)
    await this.recruitModeratorService.hasPermissionToApplicantOrThrow(profileUid, id)
    const notes = await this.recruitNoteService.getNotes(id, profileUid)
    return RecruitApplicantNotesModel.fromEntities(notes, profileUid)
  }

  @Post(':id/notes')
  @HttpCode(HttpStatus.CREATED)
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: `Create applicant's note` })
  @ApiCreatedResponse({ type: RecruitApplicantNoteModel })
  @ApiForbiddenResponse({ description: 'No permission to view applicant' })
  async createRecruitApplicantNote(
    @Param() { id }: UuidParamDto,
    @Body() dto: RecruitNoteBodyDto,
    @UserCtx() user: User,
  ): Promise<RecruitApplicantNoteModel> {
    const profileUid = ObjectIdUuidConverter.toUuid(user.id!)
    await this.recruitModeratorService.hasPermissionToApplicantOrThrow(profileUid, id)
    const note = await this.recruitNoteService.createNote(dto.toCreateEntity(id, profileUid))
    return RecruitApplicantNoteModel.fromEntity(note, profileUid)
  }

  @Put(':id/notes/:noteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: `Edit applicant's note` })
  @ApiNoContentResponse()
  @ApiForbiddenResponse({ description: 'No permission to view applicant' })
  async editRecruitApplicantNote(
    @Param() { noteId }: RecruitNoteParamDto,
    @Body() dto: RecruitNoteBodyDto,
    @UserCtx() user: User,
  ): Promise<void> {
    const profileUid = ObjectIdUuidConverter.toUuid(user.id!)
    await this.recruitNoteService.editNote(noteId, dto.toEditEntity(), profileUid)
  }

  @Delete(':id/notes/:noteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: `Delete applicant's note` })
  @ApiNoContentResponse()
  @ApiForbiddenResponse({ description: 'No permission to view applicant' })
  async deleteRecruitApplicantNote(@Param() { noteId }: RecruitNoteParamDto, @UserCtx() user: User): Promise<void> {
    const profileUid = ObjectIdUuidConverter.toUuid(user.id!)
    await this.recruitNoteService.deleteNote(noteId, profileUid)
  }
}
