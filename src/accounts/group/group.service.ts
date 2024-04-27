import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { GroupModel } from 'src/models/accounts/group.model'

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(GroupModel)
    private readonly groupModel: ReturnModelType<typeof GroupModel>,
  ) {}

  getGroupsNames(ids: number[]): Promise<string[]> {
    return this.groupModel
      .find({ _id: { $in: ids } })
      .distinct('name')
      .exec()
  }

  getGroupsIds(names: string[]): Promise<number[]> {
    return this.groupModel
      .find({ name: { $in: names } })
      .distinct('_id')
      .exec()
  }

  findById(id: number) {
    return this.groupModel.findById(id).exec()
  }

  findByName(name: string) {
    return this.groupModel.findOne({ name }).exec()
  }

  async create(name: string) {
    const existing = await this.findByName(name)
    if (existing) {
      return existing
    }
    return this.groupModel.create({ name })
  }
}
