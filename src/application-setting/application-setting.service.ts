import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { ApplicationSettingEntity } from 'src/entities/application-setting.entity'
import { Config } from 'src/enums/config.enum'
import { Encryption } from 'src/helpers/encryption'
import { Repository } from 'typeorm'

@Injectable()
export class ApplicationSettingService extends Encryption {
  private readonly googleCredential = 'google_credential'

  constructor(
    @InjectRepository(ApplicationSettingEntity)
    private readonly repository: Repository<ApplicationSettingEntity>,
    configService: ConfigService,
  ) {
    super(configService.getOrThrow(Config.ENCRYPTION_KEY))
  }

  protected async get(key: string): Promise<string> {
    const row = await this.repository.findOneBy({ id: key })
    if (!row) throw new Error(`Setting ${key} is not found`)
    return this.decrypt(row.value)
  }

  protected async set(key: string, value: string): Promise<void> {
    const entity = new ApplicationSettingEntity({ id: key, value: this.encrypt(value) })
    await this.repository.upsert(entity, { conflictPaths: { id: true } })
  }

  getGoogleCredential() {
    return this.get(this.googleCredential)
  }

  setGoogleCredential(value: string) {
    return this.set(this.googleCredential, value)
  }
}
