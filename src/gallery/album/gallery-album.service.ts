import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import { Span } from 'nestjs-otel'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'

@Injectable()
export class GalleryAlbumService {
  constructor(
    @InjectModel(GalleryAlbumModel)
    private readonly albumModel: ReturnModelType<typeof GalleryAlbumModel>,
  ) {}

  @Span()
  async findByActivity(activityId: string, includesUnpublished = false): Promise<DocumentType<GalleryAlbumModel>[]> {
    const query = this.albumModel.find({ activity: activityId, deleted: false })
    if (!includesUnpublished) query.where({ published: true, published_at: { $lte: new Date() } })
    const albums = await query.sort({ rank: 1 }).exec()
    return albums
  }

  @Span()
  async findById(id: string): Promise<GalleryAlbumModel | null> {
    return await this.albumModel.findById(id).populate('activity').exec()
  }

  async create(activityId: string, model: Omit<GalleryAlbumModel, '_id' | 'deleted'>) {
    const album = await this.albumModel.create({ ...model, activity: activityId })
    return album
  }

  async update(id: string, model: Omit<GalleryAlbumModel, '_id' | 'deleted'>) {
    const activity = await this.albumModel.findByIdAndUpdate(id, model, { new: true }).exec()
    return activity
  }

  async rankAlbums(activityId: string, albumIds: string[]): Promise<GalleryAlbumModel[]> {
    const rankMapper = Object.fromEntries(albumIds.map((id, i) => [id, i]))
    const albums = await this.findByActivity(activityId, true)
    albums.forEach((album) => (album.rank = rankMapper[album._id] ?? albumIds.length))
    await Promise.all(albums.map((album) => album.save()))
    albums.sort((a, b) => a.rank! - b.rank!)
    return albums
  }

  async remove(id: string) {
    return await this.albumModel.updateOne({ _id: id }, { deleted: true }).exec()
  }
}
