/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Logger } from '@nestjs/common'
import { Types } from 'mongoose'
import { parse as uuidParse, stringify as uuidStringify } from 'uuid'
import { V7Generator } from 'uuidv7'

export class ObjectIdUuidConverter {
  private static readonly logger = new Logger(ObjectIdUuidConverter.name)

  private static isObjectIdString(str: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(str)
  }

  static toUuid<T extends Types.ObjectId | string | undefined | null>(
    objectId: T,
  ): string | (undefined extends T ? undefined : never) | (null extends T ? null : never) {
    if (objectId === undefined) return objectId as undefined extends T ? undefined : never
    if (objectId === null) return objectId as null extends T ? null : never
    const bytes =
      typeof objectId === 'string'
        ? Uint8Array.from(objectId.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? [])
        : objectId.id
    const paddedBytes = new Uint8Array(16)
    paddedBytes.set(bytes.slice(0, 6), 0)
    paddedBytes.set([0x80, 0, 0x80], 6) // Set version (8) and variant (RFC4122) bits.
    paddedBytes.set(bytes.slice(6, 12), 9)
    return uuidStringify(paddedBytes)
  }

  static toUuidV7(objectId: Types.ObjectId): string {
    const uuid = new V7Generator().generateOrAbortCore(objectId.getTimestamp().getTime(), 0)
    if (!uuid) throw new Error('Failed to generate UUIDv7 from ObjectId ' + objectId.toString())
    return uuid.toString()
  }

  static toObjectId(uuid: string): Types.ObjectId {
    if (this.isObjectIdString(uuid)) {
      this.logger.warn(`Input is already an ObjectId string format: ${uuid}`)
      return new Types.ObjectId(uuid)
    }
    return new Types.ObjectId(this.toObjectIdBytes(uuid))
  }

  static toHexString(uuid: string): string {
    if (this.isObjectIdString(uuid)) {
      this.logger.warn(`Input is already an ObjectId string format: ${uuid}`)
      return uuid
    }
    return this.toObjectIdBytes(uuid).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
  }

  private static toObjectIdBytes(uuid: string): Uint8Array {
    const paddedBytes = uuidParse(uuid)
    const bytes = new Uint8Array(12)
    bytes.set(paddedBytes.slice(0, 6), 0)
    bytes.set(paddedBytes.slice(9, 15), 6)
    return bytes
  }
}
