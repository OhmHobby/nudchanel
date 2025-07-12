import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { parseDN } from 'ldapjs'
import { Span } from 'nestjs-otel'
import { Repository } from 'typeorm'
import { ProfilePhotoService } from 'src/accounts/profile/profile-photo.service'
import { Config } from 'src/enums/config.enum'
import { ImageFormat } from 'src/enums/image-format.enum'
import { LdapRequestScope } from 'src/enums/ldap-request-scope.enum'
import { LdapObject } from 'src/ldap-server/types/ldap-object.type'
import { LdapRequest } from 'src/ldap-server/types/ldap-request.type'
import { UserLocalUserEntity } from 'src/entities/accounts/user-local-user.entity'
import { ProfileService } from 'src/accounts/profile/profile.service'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'

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
  ) {
    this.baseDn = configService.getOrThrow(Config.LDAP_BASE_DN)
  }

  @Span()
  async findUsers(req: LdapRequest) {
    const query = this.userLocalUserRepository.createQueryBuilder('user')

    const findUid = /uid=(\w+)/.exec(req.dn?.toString())?.at(1)
    if (req.scope === LdapRequestScope.Base && findUid) {
      query.where('user.username = :username', { username: findUid })
    }

    const filterByUid = req.filter.filters?.filter((el) => el.attribute === 'uid' && el.value)?.map((el) => el.value)
    if (filterByUid?.length) {
      query.andWhere('user.username IN (:...usernames)', { usernames: filterByUid })
    }

    return await query.getMany()
  }

  @Span()
  async handler(req: LdapRequest, res): Promise<LdapObject[]> {
    const withPhoto = req.attributes.some((el) => el.toLowerCase() === 'jpegphoto')
    const users = await this.findUsers(req)
    const promises = users.map(async (userLocal) => {
      const user = await this.toLdapObject(userLocal, withPhoto)
      if (!user) return
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
    const ldapUsers = await Promise.all(promises)
    return ldapUsers.filter((el) => !!el)
  }

  @Span()
  async toLdapObject(user: UserLocalUserEntity, withPhoto = false): Promise<LdapObject | undefined> {
    if (!user.id || !user.profileId) return undefined

    // Convert UUID back to ObjectId for the profile service
    const profileObjectId = ObjectIdUuidConverter.toObjectId(user.profileId)

    // Get profile data using the profile service
    const profile = await this.profileService.findByIdPopulated(profileObjectId)
    if (!profile || !profile.emails?.length) return undefined

    // Get profile names in English
    const englishName = profile.populatedNames?.find((name) => name.lang === 'en')
    if (!englishName) return undefined

    return {
      dn: parseDN(`uid=${user.username}, ou=users, ${this.baseDn}`),
      attributes: {
        cn: `${englishName.firstname} ${englishName.lastname}`,
        uid: user.username,
        uidNumber: user.id + SearchDnUserService.USER_PADDING,
        gidNumber: user.id + SearchDnUserService.USER_PADDING,
        mail: profile.emails[0],
        givenName: englishName.firstname,
        sn: englishName.lastname,
        objectclass: ['top', 'posixAccount', 'sambaDomain'],
        sambaDomainName: 'nudchannel',
        jpegPhoto: withPhoto
          ? await this.profilePhotoService.getPhotoBuffer(profile.photo, ImageFormat.jpeg).catch(() => null)
          : null,
      },
    }
  }
}
