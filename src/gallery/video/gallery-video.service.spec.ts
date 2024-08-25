import { getModelToken } from '@m8a/nestjs-typegoose'
import { Test } from '@nestjs/testing'
import { getModelForClass } from '@typegoose/typegoose'
import { YouTubeService } from 'src/google/youtube.service'
import { YouTubeVideoModel } from 'src/models/gallery/youtube-video.model'
import { TestData } from 'test/test-data'
import { GalleryVideoService } from './gallery-video.service'

jest.mock('src/google/youtube.service')

describe(GalleryVideoService.name, () => {
  let service: GalleryVideoService
  const videoModel = getModelForClass(YouTubeVideoModel)

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GalleryVideoService,
        YouTubeService,
        { provide: getModelToken(YouTubeVideoModel.name), useValue: videoModel },
      ],
    }).compile()

    service = module.get(GalleryVideoService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(GalleryVideoService.prototype.findByActivity.name, () => {
    it('should filter unpublished correctly', async () => {
      videoModel.find = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([TestData.aValidYouTubeVideo().build(), TestData.aValidYouTubeVideo().build()]),
      })
      service.getGalleryYoutubeVideo = jest
        .fn()
        .mockResolvedValueOnce(TestData.aValidGalleryYouTubeVideo().withId('1').withPublished(true).build())
        .mockResolvedValueOnce(TestData.aValidGalleryYouTubeVideo().withId('2').withPublished(false).build())
      const result = await service.findByActivity('')
      expect(result).toContainEqual(expect.objectContaining({ id: '1' }))
      expect(result).not.toContainEqual(expect.objectContaining({ id: '2' }))
    })

    it('should show all correctly', async () => {
      videoModel.find = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([TestData.aValidYouTubeVideo().build(), TestData.aValidYouTubeVideo().build()]),
      })
      service.getGalleryYoutubeVideo = jest
        .fn()
        .mockResolvedValueOnce(TestData.aValidGalleryYouTubeVideo().withId('1').withPublished(true).build())
        .mockResolvedValueOnce(TestData.aValidGalleryYouTubeVideo().withId('2').withPublished(false).build())
      const result = await service.findByActivity('', true)
      expect(result).toContainEqual(expect.objectContaining({ id: '1' }))
      expect(result).toContainEqual(expect.objectContaining({ id: '2' }))
    })
  })
})
