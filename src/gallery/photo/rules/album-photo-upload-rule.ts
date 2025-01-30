import { AlbumPhotoUploadRule as AlbumPhotoUploadRuleProtobuf } from '@nudchannel/protobuf/dist/album_photo_upload_rule'
import { Timestamp } from '@nudchannel/protobuf/dist/google/protobuf/timestamp'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { GalleryAlbumEntity } from 'src/entities/gallery/gallery-album.entity'
import { UploadTaskRuleNoDuplication } from './upload-task-rules/upload-task-rule-no-duplication'
import { UploadTaskRulePixelResolution } from './upload-task-rules/upload-task-rule-pixel-resolution'
import { UploadTaskRuleTimeTakenAfter } from './upload-task-rules/upload-task-rule-time-taken-after'
import { UploadTaskRuleTimeTakenBefore } from './upload-task-rules/upload-task-rule-time-taken-before'
import { UploadTaskRuleWatermark } from './upload-task-rules/upload-task-rule-watermark'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

export class AlbumPhotoUploadRule {
  readonly noDuplication?: boolean

  readonly takenAfter?: dayjs.Dayjs

  readonly takenBefore?: dayjs.Dayjs

  readonly minimumResoluionMp?: number

  readonly watermarkPreset?: string

  constructor(obj?: Partial<AlbumPhotoUploadRule>) {
    Object.assign(this, obj)
  }

  get takenAfterDate(): Date | undefined {
    return this.takenAfter?.toDate()
  }

  get takenBeforeDate(): Date | undefined {
    return this.takenBefore?.toDate()
  }

  get takenAfterTimestamp(): Timestamp | undefined {
    return this.takenAfterDate && Timestamp.fromDate(this.takenAfterDate)
  }

  get takenBeforeTimestamp(): Timestamp | undefined {
    return this.takenBeforeDate && Timestamp.fromDate(this.takenBeforeDate)
  }

  isResolutionMetRequirement(photoResolution: number) {
    const MEGA_PIXEL = 1000000
    const resolutionRequirement = this.minimumResoluionMp ?? 0
    const minimumResolution = resolutionRequirement * MEGA_PIXEL
    return photoResolution >= minimumResolution
  }

  isTakenAfterDateMetRequirement(takenDate: Date) {
    return this.takenAfter ? dayjs(takenDate).isSameOrAfter(this.takenAfter) : true
  }

  isTakenBeforeDateMetRequirement(takenDate: Date) {
    return this.takenBefore ? dayjs(takenDate).isSameOrBefore(this.takenBefore) : true
  }

  toBuffer() {
    return Buffer.from(
      AlbumPhotoUploadRuleProtobuf.toBinary({
        takenAfter: this.takenAfterTimestamp || undefined,
        takenBefore: this.takenBeforeTimestamp || undefined,
        minimumMegapixel: this.minimumResoluionMp || undefined,
        watermark: this.watermarkPreset || undefined,
      }),
    )
  }

  toPattern(): string[] {
    return [
      this.noDuplication && 'NO_DUP',
      this.minimumResoluionMp && `PX_${this.minimumResoluionMp}MP`,
      this.takenAfter && `TA_${this.takenAfter.unix()}`,
      this.takenBefore && `TB_${this.takenBefore.unix()}`,
      this.watermarkPreset && `WM_${this.watermarkPreset}`,
    ].filter((el) => typeof el === 'string')
  }

  static fromBuffer(content?: Buffer) {
    if (!content) return null
    const payload = AlbumPhotoUploadRuleProtobuf.fromBinary(content)
    return new AlbumPhotoUploadRule({
      takenAfter: payload.takenAfter ? dayjs(Timestamp.toDate(payload.takenAfter)) : undefined,
      takenBefore: payload.takenBefore ? dayjs(Timestamp.toDate(payload.takenBefore)) : undefined,
      minimumResoluionMp: payload.minimumMegapixel,
      watermarkPreset: payload.watermark,
    })
  }

  static fromPattern(rules: string[]) {
    return new AlbumPhotoUploadRule({
      noDuplication: new UploadTaskRuleNoDuplication(rules).isValid(),
      takenAfter: new UploadTaskRuleTimeTakenAfter(rules).getValue(),
      takenBefore: new UploadTaskRuleTimeTakenBefore(rules).getValue(),
      minimumResoluionMp: new UploadTaskRulePixelResolution(rules).getValue(),
      watermarkPreset: new UploadTaskRuleWatermark(rules).getValue(),
    })
  }

  static fromEntity(entity: GalleryAlbumEntity) {
    return new AlbumPhotoUploadRule({
      noDuplication: true,
      takenAfter: entity.takenAfter ? dayjs(entity.takenAfter) : undefined,
      takenBefore: entity.takenBefore ? dayjs(entity.takenBefore) : undefined,
      minimumResoluionMp: entity.minimumResolutionMp || undefined,
      watermarkPreset: entity.watermarkPreset || undefined,
    })
  }
}
