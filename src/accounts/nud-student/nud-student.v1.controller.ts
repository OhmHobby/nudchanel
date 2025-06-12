import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { User } from '@nudchannel/auth'
import { Types } from 'mongoose'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { UserCtx } from 'src/auth/user.decorator'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { GetNudStudentsDto } from './dto/get-nud-students.dto'
import { NudStudentParamDto } from './dto/nud-student-param.dto'
import { UpdateNudStudentDto } from './dto/update-nud-student.dto'
import { NudStudentModel } from './models/nud-student.model'
import { NudStudentsModel } from './models/nud-students.model'
import { NudStudentService } from './nud-student.service'

@Controller({ path: 'nud-students', version: '1' })
@ApiTags('NudStudentV1')
export class NudStudentV1Controller {
  constructor(private readonly nudStudentService: NudStudentService) {}

  @Get()
  @AuthGroups()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOkResponse({ type: NudStudentsModel })
  getNudStudents(@Query() query: GetNudStudentsDto, @UserCtx() user: User) {
    return this.nudStudentService
      .getStudents(query.profileId?.objectId ?? new Types.ObjectId(user.id))
      .then(NudStudentsModel.fromEntities)
  }

  @Get(':studentId')
  @AuthGroups('nudch')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOkResponse({ type: NudStudentModel })
  getNudStudent(@Param() params: NudStudentParamDto) {
    return this.nudStudentService
      .getStudent(params.studentId)
      .then((student) => (student ? NudStudentModel.fromEntity(student) : null))
  }

  @Put(':studentId')
  @AuthGroups()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiNoContentResponse()
  updateNudStudent(@Param() params: NudStudentParamDto, @Body() body: UpdateNudStudentDto, @UserCtx() user: User) {
    return this.nudStudentService.updateStudent(
      body.toEntity(params.studentId, body.profileId?.uuid ?? ObjectIdUuidConverter.toUuid(user.id!)),
    )
  }
}
