import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { parseDN } from 'ldapjs'
import { Span } from 'nestjs-otel'
import { ProfileNameService } from 'src/accounts/profile/profile-name.service'
import { ProfilePhotoService } from 'src/accounts/profile/profile-photo.service'
import { ProfileService } from 'src/accounts/profile/profile.service'
import { ProfileNameMap } from 'src/accounts/types/profile-name-map.type'
import { UserLocalUserEntity } from 'src/entities/accounts/user-local-user.entity'
import { Config } from 'src/enums/config.enum'
import { ImageFormat } from 'src/enums/image-format.enum'
import { LdapRequestScope } from 'src/enums/ldap-request-scope.enum'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { LdapObject } from 'src/ldap-server/types/ldap-object.type'
import { LdapRequest } from 'src/ldap-server/types/ldap-request.type'
import { ProfileModel } from 'src/models/accounts/profile.model'
import { In, Repository } from 'typeorm'

@Injectable()
export class SearchDnUserService {
  static readonly USER_PADDING = 1000

  private readonly logger = new Logger(SearchDnUserService.name)

  private readonly baseDn: string

  constructor(
    configService: ConfigService,
    @InjectRepository(UserLocalUserEntity)
    private readonly userLocalUserRepository: Repository<UserLocalUserEntity>,
    private readonly profilePhotoService: ProfilePhotoService,
    private readonly profileService: ProfileService,
    private readonly profileNameService: ProfileNameService,
  ) {
    this.baseDn = configService.getOrThrow(Config.LDAP_BASE_DN)
  }

  @Span()
  async findUsers(req: LdapRequest): Promise<LdapObject[]> {
    const query = this.userLocalUserRepository.createQueryBuilder('user')

    const findUid = /uid=(\w+)/.exec(req.dn?.toString())?.at(1)
    if (req.scope === LdapRequestScope.Base && findUid) {
      query.andWhere({ username: findUid })
    }

    const filterByUid = req.filter.filters?.filter((el) => el.attribute === 'uid' && el.value)?.map((el) => el.value)
    if (filterByUid?.length) {
      query.andWhere({ username: In(filterByUid) })
    }

    const users = await query.getMany()

    const profileIds = users.map((el) => ObjectIdUuidConverter.toObjectId(el.profileId))
    const [profileMap, profileNameMap] = await Promise.all([
      this.profileService.profileMap(profileIds),
      this.profileNameService.getProfilesNameMap(profileIds),
    ])

    const withPhoto = req.attributes.some((el) => el.toLowerCase() === 'jpegphoto')
    const ldapObjects = await Promise.all(
      users.map((userLocal) => this.toLdapObject(userLocal, profileMap, profileNameMap, withPhoto)),
    )
    return ldapObjects.filter((el) => el !== null)
  }

  @Span()
  async handler(req: LdapRequest, res): Promise<LdapObject[]> {
    const users = await this.findUsers(req)
    const promises = users.map((user) => {
      const isMatched =
        (req.scope === LdapRequestScope.Base && req.dn?.equals(user.dn)) ||
        (req.scope !== LdapRequestScope.Base && req.filter.matches(user.attributes))
      this.logger.debug({
        message: isMatched ? `Sending ${user.dn}` : `Skipped ${user.dn}`,
        object: user,
        req: req.json,
      })
      if (isMatched) {
        res.send(user)
        return user
      }
    })
    return promises.filter((el) => !!el)
  }

  @Span()
  async toLdapObject(
    user: UserLocalUserEntity,
    profileMap: Map<string, ProfileModel>,
    profileNameMap: ProfileNameMap,
    withPhoto = false,
  ): Promise<LdapObject | null> {
    const profile = profileMap.get(user.profileId)
    const profileName = profileNameMap.get(user.profileId)
    if (!profileName || !profile) {
      this.logger.error({ message: 'Profile not found', user })
      return null
    }
    if (!profile.emails?.length) {
      this.logger.error({ message: 'Profile email not found', user })
      return null
    }

    return {
      dn: parseDN(`uid=${user.username}, ou=users, ${this.baseDn}`),
      attributes: {
        cn: `${profileName.firstname} ${profileName.lastname}`,
        uid: user.username,
        uidNumber: user.id + SearchDnUserService.USER_PADDING,
        gidNumber: user.id + SearchDnUserService.USER_PADDING,
        mail: profile.emails[0],
        givenName: profileName.firstname,
        sn: profileName.lastname,
        objectclass: ['top', 'posixAccount', 'sambaDomain'],
        sambaDomainName: 'nudchannel',
        jpegPhoto: withPhoto
          ? await this.profilePhotoService.getPhotoBuffer(profile.photo, ImageFormat.jpeg).catch(() => null)
          : null,
      },
    }
  }
}
