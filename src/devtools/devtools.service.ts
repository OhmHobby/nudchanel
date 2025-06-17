import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SignAccessToken } from '@nudchannel/auth'
import dayjs from 'dayjs'
import { Response } from 'express'
import { ApplicationSettingService } from 'src/application-setting/application-setting.service'
import { CookieToken } from 'src/auth/cookie-token'
import { Config } from 'src/enums/config.enum'
import { validate as uuidValidate } from 'uuid'
import { GenerateDevTokenDto } from './dto/generate-dev-token.dto'

const DEV_TOKEN_EXPIRY_HOURS = 8

@Injectable()
export class DevtoolsService {
  constructor(
    private readonly applicationSettingService: ApplicationSettingService,
    private readonly configService: ConfigService,
  ) {}

  async generateDevToken(dto: GenerateDevTokenDto, res: Response): Promise<string> {
    const devtoolsEnabled = await this.applicationSettingService.getIsDevToolsEnabled()
    if (!devtoolsEnabled || !uuidValidate(devtoolsEnabled)) {
      throw new UnauthorizedException('Devtools is not enabled')
    }
    const privateKey = this.configService.get(Config.NUDCH_TOKEN_PRIVATE_KEY)
    const issuer = this.configService.get(Config.NUDCH_TOKEN_ISSUER)
    const signAccessToken = new SignAccessToken(issuer, privateKey)
    const expiryDate = dayjs().add(DEV_TOKEN_EXPIRY_HOURS, 'hour')
    const expiresInSeconds = expiryDate.diff(dayjs(), 'second')
    signAccessToken.expires = expiresInSeconds
    const token = await signAccessToken.setProfileId(dto.userId.toString()).setGroups(dto.groups).sign()
    res.cookie(CookieToken.ACCESS_TOKEN_COOKIE_NAME, token, {
      secure: this.configService.get(Config.NUDCH_TOKEN_SECURE),
      expires: expiryDate.toDate(),
    })
    return token
  }
}
