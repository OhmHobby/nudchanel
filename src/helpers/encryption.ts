import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

export class Encryption {
  private readonly IV_SIZE = 16

  private readonly ALGORITHM = 'aes-256-ctr'

  private readonly ENCODING = 'hex'

  private readonly IV_SEPERATOR = ':'

  private readonly KEY: Buffer

  constructor(key: string) {
    this.KEY = Buffer.from(key, this.ENCODING)
  }

  protected encrypt(val: string): string {
    const iv = randomBytes(this.IV_SIZE)
    const cipher = createCipheriv(this.ALGORITHM, this.KEY, iv)
    const encrypted = Buffer.concat([cipher.update(val), cipher.final()])
    return iv.toString(this.ENCODING) + this.IV_SEPERATOR + encrypted.toString(this.ENCODING)
  }

  protected decrypt(val: string, key = this.KEY): string {
    const [iv, encrypted] = val.split(this.IV_SEPERATOR).map((el) => Buffer.from(el, this.ENCODING))
    const decipher = createDecipheriv(this.ALGORITHM, key, iv)
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString()
  }
}
