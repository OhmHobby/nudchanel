/* eslint-disable @typescript-eslint/no-magic-numbers */
import { createHash, Hash } from 'crypto'
import { Readable } from 'stream'

export class MD5 {
  constructor(private readonly hash: Hash) {}

  get hex() {
    return this.hash.digest('hex')
  }

  get uuid() {
    return MD5.hexToUuid(this.hex)
  }

  static fromBuffer(buffer: Buffer) {
    return new MD5(createHash('md5').update(buffer))
  }

  static fromStream(stream: Readable): Promise<MD5> {
    return new Promise((resolve, reject) => {
      const hash = createHash('md5')
      try {
        stream.on('data', (data) => hash.update(data))
        stream.on('end', () => resolve(new MD5(hash)))
        stream.on('error', (err) => reject(err))
      } catch (err) {
        return reject(err)
      }
    })
  }

  static uuidToHex<T extends string | undefined | null>(
    uuid: T,
  ): string | (undefined extends T ? undefined : never) | (null extends T ? null : never) {
    if (uuid === undefined) return uuid as undefined extends T ? undefined : never
    if (uuid === null) return uuid as null extends T ? null : never
    return uuid.replaceAll('-', '')
  }

  static hexToUuid<T extends string | undefined | null>(
    hex: T,
  ): string | (undefined extends T ? undefined : never) | (null extends T ? null : never) {
    if (hex === undefined) return hex as undefined extends T ? undefined : never
    if (hex === null) return hex as null extends T ? null : never
    return (
      hex.substring(0, 8) +
      '-' +
      hex.substring(8, 12) +
      '-' +
      hex.substring(12, 16) +
      '-' +
      hex.substring(16, 20) +
      '-' +
      hex.substring(20)
    ).toLowerCase()
  }
}
