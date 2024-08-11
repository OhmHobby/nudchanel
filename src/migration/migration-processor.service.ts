import { Process, Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { Job } from 'bull'
import { ProfilePhotoService } from 'src/accounts/profile/profile-photo.service'
import { BullJobName } from 'src/enums/bull-job-name.enum'
import { BullQueueName } from 'src/enums/bull-queue-name.enum'
import { PhotoProfilePhotoModel } from 'src/models/photo/profile-photo'

@Injectable()
@Processor(BullQueueName.Migration)
export class MigrationProcessorService {
  private readonly logger = new Logger(MigrationProcessorService.name)

  constructor(private readonly profilePhotoService: ProfilePhotoService) {}

  @Process(BullJobName.MigrateProfilePhoto)
  async migrateProfilePhoto({ data }: Job<PhotoProfilePhotoModel>) {
    try {
      const result = await this.profilePhotoService.importFromNas(data.directory, data.filename, data.profile)
      this.logger.log({ message: 'Migrate profile photo successfully', data, result })
    } catch (err) {
      this.logger.error({ message: 'Failed to migrate profile photo', data }, err)
      throw err
    }
  }
}
