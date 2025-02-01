import { Types } from 'mongoose'
import { validate } from 'uuid'
import { ObjectIdUuidConverter } from './objectid-uuid-converter'

describe(ObjectIdUuidConverter.name, () => {
  const testObjectId = '5b794c41fd533e3b2f61cf05'
  const testUuid = '5b794c41-fd53-8000-803e-3b2f61cf0500'

  describe(ObjectIdUuidConverter.toUuid.name, () => {
    test('undefined', () => {
      const result = ObjectIdUuidConverter.toUuid(undefined)
      expect(result).toBe(undefined)
    })

    test('null', () => {
      const result = ObjectIdUuidConverter.toUuid(null)
      expect(result).toBe(null)
    })

    test('Types.ObjectId', () => {
      const result = ObjectIdUuidConverter.toUuid(new Types.ObjectId(testObjectId))
      expect(validate(result)).toBe(true)
      expect(result).toBe(testUuid)
    })

    test('Hex string', () => {
      const result = ObjectIdUuidConverter.toUuid(testObjectId)
      expect(validate(result)).toBe(true)
      expect(result).toBe(testUuid)
    })
  })

  test(ObjectIdUuidConverter.toObjectId.name, () => {
    const result = ObjectIdUuidConverter.toObjectId(testUuid)
    expect(result.toHexString()).toEqual(testObjectId)
  })

  test(ObjectIdUuidConverter.toObjectId.name, () => {
    const result = ObjectIdUuidConverter.toHexString(testUuid)
    expect(result).toEqual(testObjectId)
  })
})
