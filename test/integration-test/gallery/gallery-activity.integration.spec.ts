import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston'
import { ClsModule } from 'nestjs-cls'
import { clsConfigFactory } from 'src/configs/cls.config'
import { configuration } from 'src/configs/configuration'
import { TypegooseConfigBuilderService } from 'src/configs/typegoose.config'
import { TypeormConfigService } from 'src/configs/typeorm.config'
import { WinstonConfig } from 'src/configs/winston.config'
import { GalleryActivityEntity } from 'src/entities/gallery-activity.entity'
import { MongoConnection } from 'src/enums/mongo-connection.enum'
import { GalleryActivityService } from 'src/gallery/activity/gallery-activity.service'
import { GalleryActivityModel } from 'src/models/gallery/activity.model'

describe('Gallery activity', () => {
  let app: INestApplication
  let galleryActivityService: GalleryActivityService
  let testActivity: GalleryActivityEntity

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
        ClsModule.forRootAsync({ global: true, useFactory: clsConfigFactory }),
        WinstonModule.forRootAsync({ useClass: WinstonConfig }),
        TypegooseModule.forRootAsync(TypegooseConfigBuilderService.build(MongoConnection.Gallery)),
        TypegooseModule.forFeature([GalleryActivityModel], MongoConnection.Gallery),
        TypeOrmModule.forRootAsync({ useClass: TypeormConfigService }),
        TypeOrmModule.forFeature([GalleryActivityEntity]),
      ],
      providers: [GalleryActivityService],
    }).compile()

    app = module.createNestApplication()
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
    await app.init()

    galleryActivityService = module.get(GalleryActivityService)
  })

  it('should be defined', () => {
    expect(galleryActivityService).toBeDefined()
  })

  it('should create with random nanoid correctly', async () => {
    testActivity = await galleryActivityService.create(
      new GalleryActivityEntity({ title: 'test - integration', time: new Date(), tags: [] }),
    )
    expect(testActivity).toEqual(expect.objectContaining({ id: expect.any(String) }))
  })

  it('should find created activity correctly', async () => {
    const result = await galleryActivityService.findById(testActivity.id!)
    expect(result).toEqual(expect.objectContaining({ title: 'test - integration' }))
  })

  afterAll(() => {
    return app.close()
  })
})
