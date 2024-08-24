import { INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { configuration } from 'src/configs/configuration'
import { PhotoMinioStorageService } from 'src/storage/photo-minio-storage.service'

describe('Photo minio', () => {
  let app: INestApplication
  let service: PhotoMinioStorageService
  let fileBuffer: Buffer
  const filename = 'preview/056d929b-ecfe-48fa-8780-a282bb5e90e2.jpg'

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] })],
      providers: [PhotoMinioStorageService],
    }).compile()

    app = module.createNestApplication()
    await app.init()

    service = module.get(PhotoMinioStorageService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('test file should be existed', async () => {
    const result = await service.isExist(filename)
    expect(result).toBe(true)
  })

  it('should able to download', async () => {
    fileBuffer = await service.getBuffer(filename)
    expect(fileBuffer.length).toBeGreaterThan(0)
  })

  it('should remove file correctly', async () => {
    await service.removeFile(filename)
    await expect(service.isExist(filename)).resolves.toBe(false)
  })

  it('should upload file correctly', async () => {
    await service.putFile(filename, fileBuffer)
    await expect(service.isExist(filename)).resolves.toBe(true)
  })

  afterAll(() => {
    app.close()
  })
})
