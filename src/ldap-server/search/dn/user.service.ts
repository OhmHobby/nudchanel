import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { isDocument, isDocumentArray, ReturnModelType } from '@typegoose/typegoose'
import { parseDN } from 'ldapjs'
import { Span } from 'nestjs-otel'
import { ProfilePhotoService } from 'src/accounts/profile/profile-photo.service'
import { Config } from 'src/enums/config.enum'
import { ImageFormat } from 'src/enums/image-format.enum'
import { LdapRequestScope } from 'src/enums/ldap-request-scope.enum'
import { LdapObject } from 'src/ldap-server/types/ldap-object.type'
import { LdapRequest } from 'src/ldap-server/types/ldap-request.type'
import { UserLocalModel } from 'src/models/accounts/user-local.model'

@Injectable()
export class SearchDnUserService {
  static readonly USER_PADDING = 1000

  private readonly logger = new Logger(SearchDnUserService.name)

  private readonly baseDn: string

  constructor(
    configService: ConfigService,
    @InjectModel(UserLocalModel)
    private readonly userLocalModel: ReturnModelType<typeof UserLocalModel>,
    private readonly profilePhotoService: ProfilePhotoService,
  ) {
    this.baseDn = configService.getOrThrow(Config.LDAP_BASE_DN)
  }

  @Span()
  findUsers(req: LdapRequest) {
    const query = this.userLocalModel.find()

    const findUid = /uid=(\w+)/.exec(req.dn?.toString())?.at(1)
    if (req.scope === LdapRequestScope.Base && findUid) query.where({ username: findUid })

    const filterByUid = req.filter.filters?.filter((el) => el.attribute === 'uid' && el.value)?.map((el) => el.value)
    if (filterByUid?.length) query.where({ username: { $in: filterByUid } })

    return query
      .populate({
        path: 'profile',
        populate: { path: 'names', select: ['profile', 'firstname', 'lastname'], match: { lang: 'en' } },
        select: ['emails', 'photo'],
      })
      .select(['username'])
      .exec()
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
        pojo: req.pojo,
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
  async toLdapObject(user: UserLocalModel, withPhoto = false): Promise<LdapObject | undefined> {
    if (
      user._id &&
      isDocument(user.profile) &&
      isDocumentArray(user.profile.names) &&
      user.profile.names.length &&
      user.profile.emails?.length
    )
      return {
        dn: parseDN(`uid=${user.username}, ou=users, ${this.baseDn}`),
        attributes: {
          cn: `${user.profile.names[0].firstname} ${user.profile.names[0].lastname}`,
          uid: user.username,
          uidNumber: user._id + SearchDnUserService.USER_PADDING,
          gidNumber: user._id + SearchDnUserService.USER_PADDING,
          mail: user.profile.emails[0],
          givenName: user.profile.names[0].firstname,
          sn: user.profile.names[0].lastname,
          objectclass: ['top', 'posixAccount', 'sambaDomain'],
          sambaDomainName: 'nudchannel',
          jpegPhoto: withPhoto
            ? await this.profilePhotoService.getPhotoBuffer(user.profile.photo, ImageFormat.jpeg).catch(() => null)
            : null,
        },
      }
  }
}
