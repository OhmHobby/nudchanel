import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ReturnModelType } from '@typegoose/typegoose'
import { parseDN } from 'ldapjs'
import { Span } from 'nestjs-otel'
import { Config } from 'src/enums/config.enum'
import { LdapRequestScope } from 'src/enums/ldap-request-scope.enum'
import { LdapObject } from 'src/ldap-server/types/ldap-object.type'
import { LdapRequest } from 'src/ldap-server/types/ldap-request.type'
import { GroupModel } from 'src/models/accounts/group.model'

@Injectable()
export class SearchDnGroupService {
  static readonly GROUP_PADDING = 100

  private readonly logger = new Logger(SearchDnGroupService.name)

  private readonly baseDn: string

  constructor(
    configService: ConfigService,
    @InjectModel(GroupModel)
    private readonly groupModel: ReturnModelType<typeof GroupModel>,
  ) {
    this.baseDn = configService.getOrThrow(Config.LDAP_BASE_DN)
  }

  @Span()
  findGroups(req: LdapRequest) {
    const query = this.groupModel.find()

    const findCn = /cn=(\w+)/.exec(req.dn?.toString())?.at(1)
    if (req.scope === LdapRequestScope.Base && findCn) query.where({ name: findCn })

    const filterByCommonNames = req.filter.filters
      ?.filter((el) => el.attribute === 'cn' && el.raw)
      ?.map((el) => el.raw?.toString())
    if (filterByCommonNames?.length) query.where({ name: { $in: filterByCommonNames } })

    return query
      .populate({
        path: 'users',
        populate: { path: 'user', select: ['username'] },
        select: ['profile'],
      })
      .select(['name'])
      .exec()
  }

  @Span()
  async handler(req: LdapRequest, res): Promise<LdapObject[]> {
    const groups = await this.findGroups(req)
    const ldapGroups = groups
      .map((group) => this.toLdapObject(group))
      .filter((group) => {
        const isMatched =
          (req.scope === LdapRequestScope.Base && req.dn?.equals(group.dn)) ||
          (req.scope !== LdapRequestScope.Base && req.filter.matches(group.attributes))
        this.logger.debug({
          message: isMatched ? `Sending ${group.dn}` : `Skipped ${group.dn}`,
          object: group,
          req: req.json,
        })
        return isMatched
      })
      .map((group) => {
        res.send(group)
        return group
      })
    return ldapGroups
  }

  toLdapObject(group: GroupModel): LdapObject {
    return {
      dn: parseDN(`cn=${group.name}, ou=groups, ${this.baseDn}`),
      attributes: {
        cn: group.name,
        gidNumber: (group._id ?? 0) + SearchDnGroupService.GROUP_PADDING,
        memberUid: group.populatedUsers?.map((el) => el.populatedUser?.username)?.filter((el) => el),
        objectclass: ['top', 'posixGroup'],
      },
    }
  }
}
