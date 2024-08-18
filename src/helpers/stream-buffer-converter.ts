import { Readable } from 'stream'

export class StreamBufferConverter {
  static bufferToStream(buffer: Buffer): Readable {
    return new Readable({
      read() {
        this.push(buffer)
        this.push(null)
      },
    })
  }

  static streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const buffers = []
      stream.on('data', (data: never) => buffers.push(data))
      stream.on('error', reject)
      stream.on('end', () => {
        resolve(Buffer.concat(buffers))
      })
    })
  }
}
