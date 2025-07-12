import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common'
import { argon2id, hash, verify } from 'argon2'
import { Span } from 'nestjs-otel'
import { UserLocalUserEntity } from 'src/entities/accounts/user-local-user.entity'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { ProfileId } from 'src/models/types'
import { Repository } from 'typeorm'
import { ProfileNameService } from '../profile/profile-name.service'

@Injectable()
export class UserLocalService {
  private readonly logger = new Logger(UserLocalService.name)

  constructor(
    @InjectRepository(UserLocalUserEntity)
    private readonly userLocalUserRepository: Repository<UserLocalUserEntity>,
    private readonly profileNameService: ProfileNameService,
  ) {}

  async findAll() {
    return await this.userLocalUserRepository.find()
  }

  @Span()
  async findByUsername(username: string, withPassword = false) {
    const query = this.userLocalUserRepository.createQueryBuilder('user')
    if (withPassword) {
      query.addSelect('user.password')
    }
    return await query.where('user.username = :username', { username }).getOne()
  }

  async findByProfile(profile: ProfileId) {
    return await this.userLocalUserRepository.findOne({
      where: { profileId: ObjectIdUuidConverter.toUuid(profile) },
    })
  }

  async getUsersHashedPassword(username: string): Promise<string> {
    const user = await this.userLocalUserRepository
      .createQueryBuilder('user')
      .select('user.password')
      .where('user.username = :username', { username })
      .getOne()
    if (!user) {
      throw new Error('Username not found')
    }
    return user.password
  }

  async isUsernameExists(username: string): Promise<boolean> {
    const count = await this.userLocalUserRepository.count({ where: { username } })
    return count > 0
  }

  usernameCleanUp(name?: string) {
    return name?.toLocaleLowerCase()?.replace(/[^a-z]/g, '')
  }

  async requestUsername(profileId: ProfileId): Promise<string> {
    const countByProfile = await this.userLocalUserRepository.count({
      where: { profileId: ObjectIdUuidConverter.toUuid(profileId) },
    })
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
    return this.userLocalUserRepository.update({ username }, { password: hashedPassword, passwordLastSet: new Date() })
  }

  async verifyAndChangePassword(profileId: ProfileId, currentPassword: string, newPassword: string) {
    const user = await this.userLocalUserRepository
      .createQueryBuilder('user')
      .select(['user.username', 'user.password'])
      .where('user.profileId = :profileId', { profileId: ObjectIdUuidConverter.toUuid(profileId) })
      .getOne()
    if (!user) throw new ForbiddenException('Current profile has no local user')
    const isValidPassword = await verify(user.password, currentPassword)
    if (!isValidPassword) throw new BadRequestException('Invalid current password')
    return this.changePassword(user.username, newPassword)
  }

  async create(username: string, plainPassword: string, profile?: ProfileId) {
    const hashedPassword = await this.hashPassword(plainPassword)
    const user = this.userLocalUserRepository.create({
      username,
      profileId: profile ? ObjectIdUuidConverter.toUuid(profile) : undefined,
      password: hashedPassword,
    })
    return await this.userLocalUserRepository.save(user)
  }

  async disableUser(username: string, disabled = true) {
    await this.userLocalUserRepository.update({ username }, { disabled })
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
      throw new BadRequestException({ error: 'Invalid credential' })
    }
  }
}
