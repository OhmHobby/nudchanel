import { InjectModel } from '@m8a/nestjs-typegoose'
import { BadRequestException, ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ReturnModelType } from '@typegoose/typegoose'
import { argon2id, hash, verify } from 'argon2'
import { Span } from 'nestjs-otel'
import { UserLocalUserEntity } from 'src/entities/accounts/user-local-user.entity'
import { UserLocalModel } from 'src/models/accounts/user-local.model'
import { ProfileId } from 'src/models/types'
import { Repository } from 'typeorm'
import { ProfileNameService } from '../profile/profile-name.service'

@Injectable()
export class UserLocalService {
  private readonly logger = new Logger(UserLocalService.name)

  constructor(
    @InjectModel(UserLocalModel)
    private readonly userLocalModel: ReturnModelType<typeof UserLocalModel>,
    @InjectRepository(UserLocalUserEntity)
    private readonly userLocalUserRepository: Repository<UserLocalUserEntity>,
    private readonly profileNameService: ProfileNameService,
  ) {}

  async findAll() {
    return await this.userLocalModel.find().exec()
  }

  @Span()
  async findByUsername(username: string, withPassword = false) {
    const query = this.userLocalModel.findOne({ username })
    if (withPassword) query.select('+password')
    return await query.exec()
  }

  async findByProfile(profile: ProfileId) {
    return await this.userLocalModel.findOne({ profile }).exec()
  }

  async getUsersHashedPassword(username: string): Promise<string> {
    const user = await this.userLocalModel.findOne({ username }).select('password').exec()
    if (!user) {
      throw new Error('Username not found')
    }
    return user.password
  }

  async isUsernameExists(username: string): Promise<boolean> {
    const count = await this.userLocalModel.countDocuments({ username }).exec()
    return !!count
  }

  usernameCleanUp(name?: string) {
    return name?.toLocaleLowerCase()?.replace(/[^a-z]/g, '')
  }

  async requestUsername(profileId: ProfileId): Promise<string> {
    const countByProfile = await this.userLocalModel.countDocuments({ profile: profileId }).exec()
    if (countByProfile) throw new Error('Username has already created')

    const name = await this.profileNameService.getProfileName(profileId, 'en')
    const firstname = this.usernameCleanUp(name?.firstname)
    const lastname = this.usernameCleanUp(name?.lastname)

    if (name.lang !== 'en') {
      throw new Error('English fullname not found')
    }

    const hasFullname = firstname && lastname
    if (!hasFullname) {
      throw new Error('Fullname required')
    }

    for (let i = 1; i < lastname.length; i++) {
      const username = firstname + lastname.slice(0, i)
      const isExists = await this.isUsernameExists(username)
      if (!isExists) {
        return username
      }
    }

    throw new Error('No username available')
  }

  hashPassword(plain: string): Promise<string> {
    return hash(plain, { type: argon2id })
  }

  async changePassword(username: string, plainPassword: string) {
    const hashedPassword = await this.hashPassword(plainPassword)
    return this.userLocalModel
      .findOneAndUpdate({ username }, { password: hashedPassword, password_last_set: new Date() })
      .exec()
  }

  async verifyAndChangePassword(profileId: ProfileId, currentPassword: string, newPassword: string) {
    const user = await this.userLocalModel.findOne({ profile: profileId }).select(['username', 'password']).exec()
    if (!user) throw new ForbiddenException('Current profile has no local user')
    const isValidPassword = await verify(user.password, currentPassword)
    if (!isValidPassword) throw new BadRequestException('Invalid current password')
    return this.changePassword(user.username, newPassword)
  }

  async create(username: string, plainPassword: string, profile?: ProfileId) {
    const hashedPassword = await this.hashPassword(plainPassword)
    return this.userLocalModel.create({
      username,
      profile,
      password: hashedPassword,
    })
  }

  async disableUser(username: string, disabled = true) {
    await this.userLocalModel.findOneAndUpdate({ username }, { disabled }).exec()
  }

  @Span()
  async signIn(username: string, plainPassword: string) {
    try {
      const user = await this.findByUsername(username, true)
      if (!user) throw new Error('User not found')
      if (user.disabled) throw new Error('User has disabled')
      const hashedPassword = user.password
      const isValidPassword = await verify(hashedPassword, plainPassword)
      if (!isValidPassword) throw new Error('Invalid password')
      return user
    } catch (err) {
      this.logger.warn({ message: err.message, username })
      throw new UnauthorizedException({ error: 'Invalid credential' })
    }
  }
}
