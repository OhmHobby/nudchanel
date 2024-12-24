import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import dayjs from 'dayjs'
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

  redirectToAppRegistrationUrl(registrationToken: string): string {
    return `/register?code=${registrationToken}`
  }
}
