import { Injectable, Logger } from '@nestjs/common'
import { createHash } from 'crypto'

@Injectable()
export class HaveIBeenPwnedService {
  private static readonly logger = new Logger(HaveIBeenPwnedService.name)

  private static readonly splitAt = 5

  private static readonly timeout = 5000

  async isPwnedPassword(password: string): Promise<boolean> {
    return await HaveIBeenPwnedService.isPwnedPassword(password)
  }

  static async isPwnedPassword(password: string): Promise<boolean> {
    try {
      const sha1 = createHash('sha1').update(password).digest('hex').toUpperCase()
      const hashPrefix = sha1.slice(0, this.splitAt)
      const hashSuffix = sha1.slice(this.splitAt)
      const url = `https://api.pwnedpasswords.com/range/${hashPrefix}`
      const response = await fetch(url, { signal: AbortSignal.timeout(this.timeout) })
      const data = await response.text()
      const lines = data.split('\n')
      const line = lines.find((line) => line.startsWith(hashSuffix))
      const count = parseInt(line?.split(':')[1] ?? '0')
      this.logger.debug({ message: `Checked pwned password: ${url} result: ${line}` })
      if (count) {
        this.logger.warn({ message: `Password has been pwned with ${count} times` })
        return true
      }
      return false
    } catch (err) {
      this.logger.error({ message: `Could not check pwned password: ${err.message}` }, err)
      return false
    }
  }
}
