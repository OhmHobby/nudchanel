import { ApiProperty } from '@nestjs/swagger'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { Orientation } from 'src/enums/orientation.enum'

dayjs.extend(duration)

export class Exif {
  constructor(width: number, height: number, orientation?: number, timestampSecond?: number, offset?: string) {
    this.setDimension(width, height, orientation)
    if (timestampSecond) this.setDate(timestampSecond, offset)
  }

  @ApiProperty({ description: 'Width after rotated by orientation' })
  width: number

  @ApiProperty({ description: 'Height after rotated by orientation' })
  height: number

  @ApiProperty()
  orientation?: number

  @ApiProperty({ type: Date, description: 'DateTime in ISOString' })
  date: Date = new Date(0)

  private setDimension(width: number, height: number, orientation?: number) {
    if (this.isNeedSwapWidthHeight(orientation)) {
      this.width = height
      this.height = width
    } else {
      this.width = width
      this.height = height
    }
    this.orientation = orientation
  }

  private isNeedSwapWidthHeight(orientation?: number) {
    return orientation === Orientation.Rotated90 || orientation === Orientation.Rotated270
  }

  private setDate(timestampSecond: number, offset?: string) {
    const DEFAULT_DATE_WITH_OFFSET = 25200
    const normalizeTimestamp =
      !isFinite(timestampSecond) || isNaN(timestampSecond) ? DEFAULT_DATE_WITH_OFFSET : timestampSecond
    const day = this.getOffsetDay(dayjs.unix(normalizeTimestamp), offset)
    this.date = day.toDate()
    return this
  }

  private getOffsetDay(day: dayjs.Dayjs, offset: string = '') {
    const OFFSET_PATTERN = /^([+-])?(\d{2}):(\d{2})$/
    const defaultOffsetDay = day.subtract(dayjs.duration({ hours: 7 }))

    if (!OFFSET_PATTERN.test(offset)) return defaultOffsetDay
    try {
      const [sign, hours, minutes] = OFFSET_PATTERN.exec(offset)!.slice(1)
      const duration = dayjs.duration({ hours: +hours, minutes: +minutes })
      return sign === '-' ? day.add(duration) : day.subtract(duration)
    } catch (err) {
      return defaultOffsetDay
    }
  }
}
