import { getModelToken } from '@m8a/nestjs-typegoose'
import { Test } from '@nestjs/testing'
import { getModelForClass } from '@typegoose/typegoose'
import { GalleryAlbumModel } from 'src/models/gallery/album.model'
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
})
