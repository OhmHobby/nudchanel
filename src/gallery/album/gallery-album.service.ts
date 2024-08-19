import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'

@Injectable()
export class GalleryAlbumService {
  constructor(
    @InjectModel(GalleryAlbumModel)
    private readonly albumModel: ReturnModelType<typeof GalleryAlbumModel>,
  ) {}

  async findByActivity(activityId: string, includesUnpublished = false): Promise<GalleryAlbumModel[]> {
    const query = this.albumModel.find({ activity: activityId, deleted: false })
    if (!includesUnpublished) query.where({ published: true, published_at: { $lte: new Date() } })
    const albums = await query.sort({ rank: 1 }).exec()
    return albums
  }

  async findById(id: string): Promise<GalleryAlbumModel | null> {
    return await this.albumModel.findById(id).populate('activity').exec()
  }
}
