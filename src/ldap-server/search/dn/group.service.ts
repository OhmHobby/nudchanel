import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { isDocument, ReturnModelType } from '@typegoose/typegoose'
import { parseDN } from 'ldapjs'
import { Span } from 'nestjs-otel'
import { UserLocalUserEntity } from 'src/entities/accounts/user-local-user.entity'
import { Config } from 'src/enums/config.enum'
import { LdapRequestScope } from 'src/enums/ldap-request-scope.enum'
import { LdapObject } from 'src/ldap-server/types/ldap-object.type'
import { LdapRequest } from 'src/ldap-server/types/ldap-request.type'
import { GroupModel } from 'src/models/accounts/group.model'
import { In, Repository } from 'typeorm'

@Injectable()
export class SearchDnGroupService {
  static readonly GROUP_PADDING = 100

  private readonly logger = new Logger(SearchDnGroupService.name)

  private readonly baseDn: string

  constructor(
    configService: ConfigService,
    @InjectModel(GroupModel)
    private readonly groupModel: ReturnModelType<typeof GroupModel>,
    @InjectRepository(UserLocalUserEntity)
    private readonly userLocalUserRepository: Repository<UserLocalUserEntity>,
  ) {
    this.baseDn = configService.getOrThrow(Config.LDAP_BASE_DN)
  }

  @Span()
  async findGroups(req: LdapRequest): Promise<LdapObject[]> {
    const query = this.groupModel.find()

    const findCn = /cn=(\w+)/.exec(req.dn?.toString())?.at(1)
    if (req.scope === LdapRequestScope.Base && findCn) query.where({ name: findCn })

    const filterByCommonNames = req.filter.filters
      ?.filter((el) => el.attribute === 'cn' && el.raw)
      ?.map((el) => el.raw?.toString())
    if (filterByCommonNames?.length) query.where({ name: { $in: filterByCommonNames } })

    const groups = await query
      .populate({
        path: 'users',
        select: ['profile', 'user'],
      })
      .select(['name'])
      .exec()
    const userIds = groups.flatMap((group) => this.getUserIds(group))
    const userIdUsernameMap = await this.userIdUsernameMap(userIds)
    return groups.map((group) => this.toLdapObject(group, userIdUsernameMap))
  }

  @Span()
  async userIdUsernameMap(userIds: number[]): Promise<Map<number, string>> {
    const users = await this.userLocalUserRepository.find({
      where: { id: In(userIds) },
      select: ['id', 'username'],
    })
    return new Map(users.map((el) => [el.id, el.username]))
  }

  @Span()
  async handler(req: LdapRequest, res): Promise<LdapObject[]> {
    const groups = await this.findGroups(req)
    const filteredGroups = groups
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
    return filteredGroups
  }

  toLdapObject(group: GroupModel, userIdUsernameMap: Map<number, string>): LdapObject {
    return {
      dn: parseDN(`cn=${group.name}, ou=groups, ${this.baseDn}`),
      attributes: {
        cn: group.name,
        gidNumber: (group._id ?? 0) + SearchDnGroupService.GROUP_PADDING,
        memberUid: this.getUserIds(group)
          ?.map((userId) => userIdUsernameMap.get(userId))
          .filter((el) => el),
        objectclass: ['top', 'posixGroup'],
      },
    }
  }

  private getUserIds(group: GroupModel): number[] {
    return (
      group.users
        ?.map((userGroup) =>
          isDocument(userGroup) && !!userGroup.user ? (userGroup.user as unknown as number[]).at(0) : undefined,
        )
        ?.filter((el) => el !== undefined) ?? []
    )
  }
}
