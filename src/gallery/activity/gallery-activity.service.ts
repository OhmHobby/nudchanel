import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable, Logger } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { GalleryActivityModel } from 'src/models/gallery/activity.model'

@Injectable()
export class GalleryActivityService {
  private readonly logger = new Logger(GalleryActivityService.name)

  constructor(
    @InjectModel(GalleryActivityModel)
    private readonly activityModel: ReturnModelType<typeof GalleryActivityModel>,
  ) {}

  async findById(id: string): Promise<GalleryActivityModel | null> {
    const activity = await this.activityModel.findById(id).exec()
    return activity
  }

  async findActivities(
    limit: number,
    before?: Date,
    search?: string,
    includesUnpublished = false,
  ): Promise<GalleryActivityModel[]> {
    const query = this.activityModel.find().sort({ time: 'desc' })
    if (before) query.where({ time: { $lt: before.getTime() } })
    if (search) {
      const searchWhere = search
        .split(/\s+/)
        .map((keyword) => [{ title: { $regex: keyword, $options: 'i' } }, { tags: { $regex: keyword, $options: 'i' } }])
        .flat()
      query.where({ $or: searchWhere })
    }
    if (!includesUnpublished) query.where({ published: true, published_at: { $lte: new Date() } })
    const activities = await query.limit(limit).exec()
    return activities
  }
}
