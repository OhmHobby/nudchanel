/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Types } from 'mongoose'
import { parse as uuidParse, stringify as uuidStringify } from 'uuid'

export class ObjectIdUuidConverter {
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

  static toObjectId(uuid: string): Types.ObjectId {
    return new Types.ObjectId(this.toObjectIdBytes(uuid))
  }

  static toHexString(uuid: string): string {
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
