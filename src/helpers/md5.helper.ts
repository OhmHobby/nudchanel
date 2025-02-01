/* eslint-disable @typescript-eslint/no-magic-numbers */
import { createHash, Hash } from 'crypto'
import { Readable } from 'stream'

export class MD5 {
  constructor(private readonly hash: Hash) {}

  get hex() {
    return this.hash.digest('hex')
  }

  get uuid() {
    const hex = this.hex
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

  static fromBuffer(buffer: Buffer) {
    return new MD5(createHash('md5').update(buffer))
  }

  static fromStream(stream: Readable) {
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
}
