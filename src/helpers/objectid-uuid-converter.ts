/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Types } from 'mongoose'
import { parse as uuidParse, stringify as uuidStringify } from 'uuid'

export class ObjectIdUuidConverter {
  static toUuid(objectId: Types.ObjectId): string {
    const bytes = objectId.id
    const paddedBytes = new Uint8Array(16)
    paddedBytes.set(bytes.slice(0, 6), 0)
    paddedBytes.set([0x80, 0, 0x80], 6) // Set version (8) and variant (RFC4122) bits.
    paddedBytes.set(bytes.slice(6, 12), 9)
    return uuidStringify(paddedBytes)
  }

  static toObjectId(uuid: string): Types.ObjectId {
    const paddedBytes = uuidParse(uuid)
    const bytes = new Uint8Array(12)
    bytes.set(paddedBytes.slice(0, 6), 0)
    bytes.set(paddedBytes.slice(9, 15), 6)
    return new Types.ObjectId(bytes)
  }
}
