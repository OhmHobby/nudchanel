import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Res } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { AuthGroups } from 'src/auth/auth-group.decorator'
import { UuidParamDto } from 'src/gallery/dto/uuid-param.dto'
import { AccountRegistrationDto } from '../dto/account-registration.dto'
import { AccountRegistrationInfoModel } from '../models/account-registration-info.model'
import { SignInService } from '../sign-in/sign-in.service'
import { RegistrationService } from './registration.service'

@Controller({ path: 'accounts/registration', version: '1' })
@ApiTags('RegistrationV1')
export class RegistrationV1Controller {
  constructor(
    private readonly signInService: SignInService,
    private readonly registrationService: RegistrationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: AccountRegistrationInfoModel })
  @ApiBearerAuth()
  @ApiCookieAuth()
  @AuthGroups('it')
  async createAccountRegistrationToken(): Promise<AccountRegistrationInfoModel> {
    const registration = await this.registrationService.createToken({})
    return AccountRegistrationInfoModel.fromModel(registration)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AccountRegistrationInfoModel })
  async getAccountRegistrationInfo(@Param() { id }: UuidParamDto): Promise<AccountRegistrationInfoModel> {
    const registration = await this.registrationService.find(id)
    if (!registration) throw new NotFoundException()
    return AccountRegistrationInfoModel.fromModel(registration)
  }

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AccountRegistrationInfoModel })
  async submitAccountRegistration(
    @Param() { id }: UuidParamDto,
    @Body() dto: AccountRegistrationDto,
    @Res({ passthrough: true }) response: Pick<Response, 'cookie'>,
  ): Promise<AccountRegistrationInfoModel> {
    const registration = await this.registrationService.useToken(id)
    if (!registration?.profile) throw new NotFoundException()

    const profile = await this.registrationService.register(registration.profile, [
      dto.name.toModel(),
      dto.localName.toModel(),
    ])

    if (registration.sign_in) {
      await this.signInService.setAccessRefreshTokenCookiesByProfile(response, profile._id, true)
    }

    return AccountRegistrationInfoModel.fromModel(registration)
  }
}
