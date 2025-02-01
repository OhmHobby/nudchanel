import { Types } from 'mongoose'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'

export class ProfileIdModel {
  constructor(readonly uuid: string) {}

  get objectId() {
    return ObjectIdUuidConverter.toObjectId(this.uuid as string)
  }

  get hexString() {
    return this.uuid ? ObjectIdUuidConverter.toHexString(this.uuid) : this.uuid
  }

  static fromUuid(uuid: string) {
    return new ProfileIdModel(uuid)
  }

  static fromObjectId<T extends Types.ObjectId | string | undefined | null>(
    objectId: T,
  ): ProfileIdModel | (undefined extends T ? undefined : never) | (null extends T ? null : never) {
    if (objectId === undefined) return objectId as undefined extends T ? undefined : never
    if (objectId === null) return objectId as null extends T ? null : never
    const uuid = ObjectIdUuidConverter.toUuid(objectId)
    return new ProfileIdModel(uuid)
  }

  static fromObjectIdOrThrow(objectId?: Types.ObjectId | string | null): ProfileIdModel {
    if (!objectId) throw new Error('Profile ID is undefined')
    return new ProfileIdModel(ObjectIdUuidConverter.toUuid(objectId))
  }
}
