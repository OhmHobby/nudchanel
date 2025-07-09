import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { AuthGroups } from 'src/auth/auth-group.decorator'
import { RECRUIT_SETTING_ID } from 'src/constants/headers.constants'
import { RecruitCtx } from '../context/recruit-context.decorator'
import { RecruitContext } from '../context/recruit-context.model'
import { AddRecruitInterviewSlotDto } from '../dto/add-recruit-interview-slot.dto'
import { BookRecruitInterviewSlotDto } from '../dto/book-recruit-interview-slot.dto'
import { RemoveRecruitInterviewSlotDto } from '../dto/remove-recruit-interview-slot.dto'
import { RecruitInterviewSlotDetailModel } from '../models/recruit-interview-slot-detail.model'
import { RecruitInterviewSlotModel } from '../models/recruit-interview-slot.model'
import { RecruitInterviewService } from './recruit-interview.service'

@Controller({ path: 'recruit/interview', version: '1' })
@ApiTags('RecruitInterviewV1')
export class RecruitInterviewV1Controller {
  private readonly logger = new Logger(RecruitInterviewV1Controller.name)

  constructor(private readonly recruitInterviewService: RecruitInterviewService) {}

  @Get('slots')
  @AuthGroups()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiOperation({
    summary: `List interview slots`,
    description: `With applicant data will show availability and selection. Moderator can see slot's roles and applicants`,
  })
  @ApiOkResponse({ type: RecruitInterviewSlotDetailModel, isArray: true })
  async getRecruitInterviewSlots(@RecruitCtx() ctx: RecruitContext): Promise<RecruitInterviewSlotDetailModel[]> {
    return await this.recruitInterviewService.getSlots(
      ctx.currentSettingId,
      ctx.applicantId ?? undefined,
      ctx.isModerator,
    )
  }

  @Put('slots/:refId/book')
  @AuthGroups()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiOperation({
    summary: `Book the interview slot`,
    description: `Will automatically cancel the selected slot and book a new one.`,
  })
  @ApiNoContentResponse()
  @ApiConflictResponse({ description: 'No available slot' })
  async bookRecruitInterviewSlot(@Param() { refId }: BookRecruitInterviewSlotDto, @RecruitCtx() ctx: RecruitContext) {
    const { start, end } = RecruitInterviewSlotModel.fromRefId(refId)
    this.logger.log(`Booking slot ${refId} (${start} - ${end}) for applicant ${ctx.applicantIdOrThrow}`)
    await this.recruitInterviewService.bookSlot(ctx.currentSettingId, ctx.applicantIdOrThrow, start, end)
  }

  @Put('slots/cancel')
  @AuthGroups()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiOperation({ summary: `Explicitly cancel the booking` })
  @ApiNoContentResponse()
  @ApiConflictResponse()
  async cancelRecruitInterviewSlot(@RecruitCtx() ctx: RecruitContext) {
    const result = await this.recruitInterviewService.cancelSlot(ctx.applicantIdOrThrow)
    if (!result) throw new ConflictException()
  }

  @Post('slots')
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiOperation({ summary: `Add interview slot` })
  @HttpCode(HttpStatus.NO_CONTENT)
  async addRecruitInterviewSlot(@RecruitCtx() ctx: RecruitContext, @Body() dto: AddRecruitInterviewSlotDto) {
    ctx.hasPermissionOrThrow(ctx.currentSettingId)
    await this.recruitInterviewService.addSlot(new Date(dto.startWhen), new Date(dto.endWhen), dto.roleIds)
  }

  @Delete('slots')
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiOperation({ summary: `Remove interview slot` })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiConflictResponse({ description: 'Cannot remove slot: one or more slots are already booked' })
  async removeRecruitInterviewSlot(@RecruitCtx() ctx: RecruitContext, @Body() dto: RemoveRecruitInterviewSlotDto) {
    ctx.hasPermissionOrThrow(ctx.currentSettingId)
    const { start, end } = RecruitInterviewSlotModel.fromRefId(dto.refId)
    await this.recruitInterviewService.removeSlot(start, end, dto.roleIds)
  }
}
