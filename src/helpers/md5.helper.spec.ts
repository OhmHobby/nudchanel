import { MD5 } from './md5.helper'

describe(MD5.name, () => {
  test('uuid', () => {
    const result = MD5.fromBuffer(Buffer.from('')).uuid
    expect(result).toBe('d41d8cd9-8f00-b204-e980-0998ecf8427e')
  })

  test(MD5.uuidToHex.name, () => {
    const result = MD5.uuidToHex('d41d8cd9-8f00-b204-e980-0998ecf8427e')
    expect(result).toBe('d41d8cd98f00b204e9800998ecf8427e')
  })
})
