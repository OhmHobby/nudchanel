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

  private readonly devToolsEnabled = 'is_devtools_enabled'

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

  protected async del(key: string): Promise<void> {
    await this.repository.delete({ id: key })
  }

  getGoogleCredential() {
    return this.get(this.googleCredential)
  }

  setGoogleCredential(value: string) {
    return this.set(this.googleCredential, value)
  }

  getIsDevToolsEnabled() {
    return this.get(this.devToolsEnabled)
  }

  async migrateSetting() {
    const key = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex')
    const gc = await this.repository.findOneBy({ id: this.googleCredential })
    if (gc) await this.set(this.googleCredential, this.decrypt(gc.value, key))
    const isDevToolsEnabled = await this.repository.findOneBy({ id: this.devToolsEnabled })
    if (isDevToolsEnabled) await this.set(this.devToolsEnabled, this.decrypt(isDevToolsEnabled.value, key))
  }
}
