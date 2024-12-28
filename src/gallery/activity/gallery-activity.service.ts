import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable, Logger } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { Span } from 'nestjs-otel'
import { GalleryActivityModel } from 'src/models/gallery/activity.model'

@Injectable()
export class GalleryActivityService {
  private readonly logger = new Logger(GalleryActivityService.name)

  constructor(
    @InjectModel(GalleryActivityModel)
    private readonly activityModel: ReturnModelType<typeof GalleryActivityModel>,
  ) {}

  @Span()
  async findById(id: string): Promise<GalleryActivityModel | null> {
    const activity = await this.activityModel.findById(id).exec()
    return activity
  }

  async create(model: Omit<GalleryActivityModel, '_id' | 'deleted'>) {
    const activity = await this.activityModel.create(model)
    return activity
  }

  async update(id: string, model: Omit<GalleryActivityModel, '_id' | 'deleted'>) {
    const activity = await this.activityModel.findByIdAndUpdate(id, model, { new: true }).exec()
    return activity
  }

  async remove(id: string) {
    return await this.activityModel.updateOne({ _id: id }, { deleted: true }).exec()
  }

  @Span()
  async findActivities(
    limit: number,
    before?: Date,
    year?: number,
    search?: string,
    includesUnpublished = false,
  ): Promise<GalleryActivityModel[]> {
    const query = this.activityModel.find({ deleted: false }).sort({ time: 'desc' })
    const beforeDate = this.selectEailerDate(before, this.academicYearEndDate(year))
    const afterDate = this.academicYearStartDate(year)
    if (afterDate) query.where({ time: { $lt: beforeDate, $gt: afterDate } })
    else if (beforeDate) query.where({ time: { $lt: beforeDate } })
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

  selectEailerDate(a?: Date, b?: Date): Date | undefined {
    if (a && b) {
      return a < b ? a : b
    }
    return a || b
  }

  academicYearStartDate(year?: number): Date | undefined {
    const mayMonthIndex = 4
    const newAcademicYearStartAt = mayMonthIndex
    const startAtDate = 1
    return year ? new Date(year, newAcademicYearStartAt, startAtDate, 0, 0, 0, 0) : undefined
  }

  academicYearEndDate(year?: number): Date | undefined {
    return year ? this.academicYearStartDate(year + 1) : undefined
  }
}
