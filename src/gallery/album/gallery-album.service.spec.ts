import { getModelToken } from '@m8a/nestjs-typegoose'
import { Test } from '@nestjs/testing'
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm'
import { getModelForClass } from '@typegoose/typegoose'
import { nanoid } from 'nanoid'
import { GALLERY_ID_LENGTH } from 'src/constants/gallery.constant'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { UploadTaskModel } from 'src/models/photo/upload-task.model'
import { TestData } from 'test/test-data'
import { GalleryAlbumService } from './gallery-album.service'

describe(GalleryAlbumService.name, () => {
  let service: GalleryAlbumService
  const dataSource = {
    transaction: jest.fn(),
  }
  const albumRepository = {
    find: jest.fn(),
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GalleryAlbumService,
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: getRepositoryToken(GalleryAlbumEntity), useValue: albumRepository },
        { provide: getModelToken(UploadTaskModel.name), useValue: getModelForClass(UploadTaskModel) },
      ],
    }).compile()

    service = module.get(GalleryAlbumService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(GalleryAlbumService.prototype.findByActivity.name, () => {
    it('should find only published correctly', async () => {
      await service.findByActivity('')
      expect(albumRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ published: true }) }),
      )
    })

    it('should find all published correctly', async () => {
      await service.findByActivity('', true)
      expect(albumRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ published: undefined }) }),
      )
    })
  })

  describe(GalleryAlbumService.prototype.create.name, () => {
    it('should create with incremental rank', async () => {
      const activityId = nanoid(GALLERY_ID_LENGTH)
      service.findByActivity = jest.fn().mockResolvedValue([TestData.aValidGalleryAlbum().build()])
      const save = jest.fn()
      dataSource.transaction.mockImplementation((cb) => cb({ save }))
      await service.create(activityId, new GalleryAlbumEntity())
      expect(save).toHaveBeenCalledWith(expect.objectContaining({ activityId, rank: 1 }))
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
      const save = jest.fn()
      dataSource.transaction.mockImplementation((cb) => cb({ save }))
      const result = await service.rankAlbums('activity-id', ['album-4', 'album-2', 'album-3'])
      expect(result.map((el) => el.id)).toEqual(['album-4', 'album-2', 'album-3', 'album-1', 'album-5'])
      expect(result.map((el) => el.rank)).toEqual([0, 1, 2, 3, 3])
    })
  })
})
