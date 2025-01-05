import { getModelToken } from '@m8a/nestjs-typegoose'
import { Test } from '@nestjs/testing'
import { getModelForClass } from '@typegoose/typegoose'
import { nanoid } from 'nanoid'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'
import { TestData } from 'test/test-data'
import { GalleryAlbumService } from './gallery-album.service'

describe(GalleryAlbumService.name, () => {
  let service: GalleryAlbumService
  const albumModel = getModelForClass(GalleryAlbumModel)

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [GalleryAlbumService, { provide: getModelToken(GalleryAlbumModel.name), useValue: albumModel }],
    }).compile()

    service = module.get(GalleryAlbumService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(GalleryAlbumService.prototype.findByActivity.name, () => {
    it('should find only published correctly', async () => {
      const query = { where: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(), exec: jest.fn() }
      albumModel.find = jest.fn().mockReturnValue(query)
      await service.findByActivity('')
      expect(query.where).toHaveBeenCalledWith(expect.objectContaining({ published: true }))
    })

    it('should find all published correctly', async () => {
      const query = { where: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(), exec: jest.fn() }
      albumModel.find = jest.fn().mockReturnValue(query)
      await service.findByActivity('', true)
      expect(query.where).not.toHaveBeenCalledWith(expect.objectContaining({ published: true }))
    })
  })

  describe(GalleryAlbumService.prototype.create.name, () => {
    it('should create with incremental rank', async () => {
      const activityId = nanoid(7)
      service.findByActivity = jest.fn().mockResolvedValue([TestData.aValidGalleryAlbum().build()])
      albumModel.create = jest.fn()
      await service.create(activityId, new GalleryAlbumModel())
      expect(albumModel.create).toHaveBeenCalledWith(expect.objectContaining({ activity: activityId, rank: 1 }))
    })
  })

  describe(GalleryAlbumService.prototype.rankAlbums.name, () => {
    it('should sort albums correctly', async () => {
      service.findByActivity = jest
        .fn()
        .mockResolvedValue([
          TestData.aValidGalleryAlbum().withId('album-1').build(),
          TestData.aValidGalleryAlbum().withId('album-2').build(),
          TestData.aValidGalleryAlbum().withId('album-3').build(),
          TestData.aValidGalleryAlbum().withId('album-4').build(),
          TestData.aValidGalleryAlbum().withId('album-5').build(),
        ])
      const result = await service.rankAlbums('activity-id', ['album-4', 'album-2', 'album-3'])
      expect(result.map((el) => el._id)).toEqual(['album-4', 'album-2', 'album-3', 'album-1', 'album-5'])
      expect(result.map((el) => el.rank)).toEqual([0, 1, 2, 3, 3])
    })
  })
})
