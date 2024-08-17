import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import dayjs from 'dayjs'
import { Types } from 'mongoose'
import { SignInTokenModel } from 'src/models/accounts/signin-token.model'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class SignInService {
  constructor(
    @InjectModel(SignInTokenModel)
    private readonly signInTokenModel: ReturnModelType<typeof SignInTokenModel>,
  ) {}

  codeExpires(): Date {
    const codeDuration = 5
    return dayjs().add(codeDuration, 'minute').toDate()
  }

  async createCode(profileId: string | Types.ObjectId): Promise<string> {
    const signinTokenDocument = await this.signInTokenModel.create({
      _id: uuidv4(),
      profile: profileId,
      expires_at: this.codeExpires(),
    })

    return signinTokenDocument._id
  }

  async useCode(code: string): Promise<string | null> {
    const signinTokenDocument = await this.signInTokenModel
      .findOneAndDelete({ _id: code, expires_at: { $gt: new Date() } })
      .exec()

    return signinTokenDocument?.profile?.toString() ?? null
  }
}
