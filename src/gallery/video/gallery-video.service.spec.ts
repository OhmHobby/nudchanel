import { Test } from '@nestjs/testing'
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm'
import { GalleryYouTubeVideoEntity } from 'src/entities/gallery/gallery-youtube-video.entity'
import { YouTubeService } from 'src/google/youtube.service'
import { TestData } from 'test/test-data'
import { GalleryVideoService } from './gallery-video.service'

jest.mock('src/google/youtube.service')

describe(GalleryVideoService.name, () => {
  let service: GalleryVideoService
  let youtubeService: YouTubeService
  const youtubeRepository = {
    findBy: jest.fn(),
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GalleryVideoService,
        YouTubeService,
        { provide: getDataSourceToken(), useValue: jest.fn() },
        { provide: getRepositoryToken(GalleryYouTubeVideoEntity), useValue: youtubeRepository },
      ],
    }).compile()

    service = module.get(GalleryVideoService)
    youtubeService = module.get(YouTubeService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(GalleryVideoService.prototype.findByActivity.name, () => {
    it('should filter unpublished correctly', async () => {
      youtubeRepository.findBy = jest
        .fn()
        .mockResolvedValue([TestData.aValidYouTubeVideo().build(), TestData.aValidYouTubeVideo().build()])
      youtubeService.getVideo = jest
        .fn()
        .mockResolvedValueOnce(TestData.aValidGalleryYouTubeVideo().withId('1').withPublished(true).build())
        .mockResolvedValueOnce(TestData.aValidGalleryYouTubeVideo().withId('2').withPublished(false).build())
      const result = await service.findByActivity('')
      expect(result).toContainEqual(expect.objectContaining({ id: '1' }))
      expect(result).not.toContainEqual(expect.objectContaining({ id: '2' }))
    })

    it('should show all correctly', async () => {
      youtubeRepository.findBy = jest
        .fn()
        .mockResolvedValue([TestData.aValidYouTubeVideo().build(), TestData.aValidYouTubeVideo().build()])
      youtubeService.getVideo = jest
        .fn()
        .mockResolvedValueOnce(TestData.aValidGalleryYouTubeVideo().withId('1').withPublished(true).build())
        .mockResolvedValueOnce(TestData.aValidGalleryYouTubeVideo().withId('2').withPublished(false).build())
      const result = await service.findByActivity('', true)
      expect(result).toContainEqual(expect.objectContaining({ id: '1' }))
      expect(result).toContainEqual(expect.objectContaining({ id: '2' }))
    })
  })
})
