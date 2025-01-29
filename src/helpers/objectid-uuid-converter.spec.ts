import { Types } from 'mongoose'
import { validate } from 'uuid'
import { ObjectIdUuidConverter } from './objectid-uuid-converter'

describe(ObjectIdUuidConverter.name, () => {
  const testObjectId = '5b794c41fd533e3b2f61cf05'
  const testUuid = '5b794c41-fd53-4000-803e-3b2f61cf0500'

  test(ObjectIdUuidConverter.toUuid.name, () => {
    const result = ObjectIdUuidConverter.toUuid(new Types.ObjectId(testObjectId))
    expect(validate(result)).toBe(true)
    expect(result).toBe(testUuid)
  })

  test(ObjectIdUuidConverter.toObjectId.name, () => {
    const result = ObjectIdUuidConverter.toObjectId(testUuid)
    expect(result.toHexString()).toEqual(testObjectId)
  })
})
