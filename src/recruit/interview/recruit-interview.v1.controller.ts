import { ConflictException, Controller, Get, HttpCode, HttpStatus, Param, Put } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { RECRUIT_SETTING_ID } from 'src/constants/headers.constants'
import { RecruitCtx } from '../context/recruit-context.decorator'
import { RecruitContext } from '../context/recruit-context.model'
import { BookRecruitInterviewSlotDto } from '../dto/book-recruit-interview-slot.dto'
import { RecruitInterviewSlotDetailModel } from '../models/recruit-interview-slot-detail.model'
import { RecruitInterviewSlotModel } from '../models/recruit-interview-slot.model'
import { RecruitInterviewService } from './recruit-interview.service'

@Controller({ path: 'recruit/interview', version: '1' })
@ApiTags('RecruitInterviewV1')
export class RecruitInterviewV1Controller {
  constructor(private readonly recruitInterviewService: RecruitInterviewService) {}

  @Get('range')
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiOkResponse({ type: RecruitInterviewSlotDetailModel })
  async getRecruitInterviewRange(@RecruitCtx() ctx: RecruitContext): Promise<RecruitInterviewSlotDetailModel> {
    const [start, end] = await this.recruitInterviewService.getRange(ctx.currentSettingId)
    return new RecruitInterviewSlotDetailModel({ start, end })
  }

  @Get('slots')
  @AuthGroups()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiHeader({ name: RECRUIT_SETTING_ID })
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
  @ApiNoContentResponse()
  async bookRecruitInterviewSlot(@Param() { refId }: BookRecruitInterviewSlotDto, @RecruitCtx() ctx: RecruitContext) {
    const { start, end } = RecruitInterviewSlotModel.fromRefId(refId)
    await this.recruitInterviewService.bookSlot(ctx.currentSettingId, ctx.applicantIdOrThrow, start, end)
  }

  @Put('slots/cancel')
  @AuthGroups()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiHeader({ name: RECRUIT_SETTING_ID })
  @ApiNoContentResponse()
  @ApiConflictResponse()
  async cancelRecruitInterviewSlot(@RecruitCtx() ctx: RecruitContext) {
    const result = await this.recruitInterviewService.cancelSlot(ctx.applicantIdOrThrow)
    if (!result) throw new ConflictException()
  }
}
