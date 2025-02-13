import { getQueueToken } from '@nestjs/bullmq'
import { Test } from '@nestjs/testing'
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm'
import { ProfileNameService } from 'src/accounts/profile/profile-name.service'
import { DataMigrationEntity } from 'src/entities/data-migration.entity'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { GalleryPhotoEntity } from 'src/entities/gallery/gallery-photo.entity'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { PhotoV1Service } from 'src/photo/photo-v1.service'
import { StorageService } from 'src/storage/storage.service'
import { GalleryAlbumPhotoService } from './gallery-album-photo.service'

jest.mock('src/accounts/profile/profile-name.service')
jest.mock('src/photo/photo-v1.service')
jest.mock('src/storage/storage.service')

describe(GalleryAlbumPhotoService.name, () => {
  let service: GalleryAlbumPhotoService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GalleryAlbumPhotoService,
        { provide: getDataSourceToken(), useValue: jest.fn() },
        { provide: getRepositoryToken(GalleryAlbumEntity), useValue: jest.fn() },
        { provide: getRepositoryToken(GalleryPhotoEntity), useValue: jest.fn() },
        { provide: getRepositoryToken(DataMigrationEntity), useValue: jest.fn() },
        { provide: getQueueToken(BullQueueName.GalleryPhotoValidation), useValue: jest.fn() },
        PhotoV1Service,
        ProfileNameService,
        StorageService,
      ],
    }).compile()

    service = module.get(GalleryAlbumPhotoService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
