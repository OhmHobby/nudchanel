import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { UserGroupModel } from 'src/models/accounts/user-group.model'
import { GroupService } from '../group/group.service'

@Injectable()
export class UserGroupService {
  constructor(
    @InjectModel(UserGroupModel)
    private readonly userGroupModel: ReturnModelType<typeof UserGroupModel>,
    private readonly groupService: GroupService,
  ) {}

  async getAllGroups(): Promise<string[]> {
    const groupIds: number[] = await this.userGroupModel.find({}).distinct('group').exec()
    return this.groupService.getGroupsNames(groupIds)
  }

  async getProfileGroups(profileId: string): Promise<string[]> {
    const groupIds: number[] = await this.userGroupModel.find({ profile: profileId }).distinct('group').exec()
    return this.groupService.getGroupsNames(groupIds)
  }

  addGroups(profileId: string, groups: number[]) {
    const insertDocuments = groups.map((group) => ({
      profile: profileId,
      group,
    }))
    return this.userGroupModel.insertMany(insertDocuments)
  }

  async removeGroups(profileId: string, groups: number[]) {
    await this.userGroupModel.deleteMany({
      profile: profileId,
      group: { $in: groups },
    })
  }

  async updateProfileGroups(profileId: string, groups: string[]): Promise<string[]> {
    const currentGroups = await this.getProfileGroups(profileId)

    const toRemoveNames = currentGroups.filter((group) => !groups.includes(group))
    const toAddNames = groups.filter((group) => !currentGroups.includes(group))

    await Promise.all(toAddNames.map((name) => this.groupService.create(name)))

    const [toRemoveIds, toAddIds] = await Promise.all([
      this.groupService.getGroupsIds(toRemoveNames),
      this.groupService.getGroupsIds(toAddNames),
    ])

    await Promise.all([this.removeGroups(profileId, toRemoveIds), this.addGroups(profileId, toAddIds)])

    return groups
  }
}
