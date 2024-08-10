import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PhotoProcessorV1Api } from '@nudchannel/photo-processor'
import { Config } from 'src/enums/config.enum'

@Injectable()
export class PhotoProcesserV1Service extends PhotoProcessorV1Api {
  constructor(configService: ConfigService) {
    super(undefined, configService.get(Config.PHOTO_PROCESSOR_URL))
  }
}
