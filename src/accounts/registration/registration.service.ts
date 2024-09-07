import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ReturnModelType } from '@typegoose/typegoose'
import dayjs from 'dayjs'
import { Config } from 'src/enums/config.enum'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { ProfileNameModel } from 'src/models/accounts/profile.name.model'
import { RegistrationTokenModel } from 'src/models/accounts/registration-token.model'
import { ProfileNameService } from '../profile/profile-name.service'
import { ProfileService } from '../profile/profile.service'

@Injectable()
export class RegistrationService {
  constructor(
    @InjectModel(RegistrationTokenModel)
    private readonly registrationTokenModel: ReturnModelType<typeof RegistrationTokenModel>,
    private readonly configService: ConfigService,
    private readonly profileService: ProfileService,
    private readonly profileNameService: ProfileNameService,
  ) {}

  tokenExpires(): Date {
    return dayjs().add(1, 'day').toDate()
  }

  find(id: string): Promise<RegistrationTokenModel | null> {
    return this.registrationTokenModel.findOne({ _id: id, expires_at: { $gt: new Date() } }).exec()
  }

  createToken(profile: Partial<ProfileModel>, autoSignIn = false): Promise<RegistrationTokenModel> {
    return this.registrationTokenModel
      .findOneAndUpdate(
        { profile },
        { expires_at: this.tokenExpires(), sign_in: autoSignIn },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec()
  }

  useToken(id: string): Promise<RegistrationTokenModel | null> {
    return this.registrationTokenModel.findOneAndDelete({ _id: id, expires_at: { $gt: new Date() } }).exec()
  }

  async register(profileDoc: Partial<ProfileModel>, names: Omit<ProfileNameModel, 'profile'>[]) {
    const profile = await this.profileService.create(profileDoc)
    await Promise.all(names.map((name) => this.profileNameService.upsert(name.lang, profile._id, name)))
    return profile
  }

  redirectToAppRegistrationUrl(registrationToken: string, continueTo?: string): string {
    const continueToUrl = new URL(continueTo ?? this.configService.getOrThrow(Config.HTTP_BASEURL_ACCOUNTS))
    const appBaseUrl = continueToUrl.origin

    const redirectUrl = new URL('/register', appBaseUrl)
    redirectUrl.searchParams.set('code', registrationToken)

    return redirectUrl.href
  }
}
