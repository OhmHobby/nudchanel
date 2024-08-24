import { Orientation } from 'src/enums/orientation.enum'
import { Exif } from './exif.model'

describe(Exif.name, () => {
  describe('Width and height', () => {
    const width = 800
    const height = 600

    it('should not rotate when no orientation tag', () => {
      const exif = new Exif(width, height)
      expect(exif.width).toBe(width)
      expect(exif.height).toBe(height)
      expect(exif.orientation).toBeUndefined()
    })

    it.each([[Orientation.Rotated0, Orientation.Rotated180]])(
      'should not rotate when orientation is %s',
      (orientation: Orientation) => {
        const exif = new Exif(width, height, orientation)
        expect(exif.width).toBe(width)
        expect(exif.height).toBe(height)
        expect(exif.orientation).toBe(orientation)
      },
    )

    it.each([[Orientation.Rotated270, Orientation.Rotated90]])(
      'should rotate when orientation is %s',
      (orientation: Orientation) => {
        const exif = new Exif(width, height, orientation)
        expect(exif.width).toBe(height)
        expect(exif.height).toBe(width)
        expect(exif.orientation).toBe(orientation)
      },
    )
  })

  describe('Date', () => {
    const date = new Date(2022, 1, 31, 10, 0)

    it('should offset by 7 when offset is undefined', () => {
      const exif = new Exif(0, 0, undefined, date.getTime() / 1000)
      expect(exif.date).toEqual(new Date(2022, 1, 31, 3, 0))
    })

    it('should offset by 7 when offset is invalid pattern', () => {
      const exif = new Exif(0, 0, undefined, date.getTime() / 1000, '+00.00')
      expect(exif.date).toEqual(new Date(2022, 1, 31, 3, 0))
    })

    it('should subtract when timestamp already offsetted by +09:00', () => {
      const exif = new Exif(0, 0, undefined, date.getTime() / 1000, '+09:00')
      expect(exif.date).toEqual(new Date(2022, 1, 31, 1, 0))
    })

    it('should not offset when timestamp already offsetted by +00:00', () => {
      const exif = new Exif(0, 0, undefined, date.getTime() / 1000, '+00:00')
      expect(exif.date).toEqual(new Date(2022, 1, 31, 10, 0))
    })

    it('should add when timestamp already offsetted by -07:00', () => {
      const exif = new Exif(0, 0, undefined, date.getTime() / 1000, '-07:00')
      expect(exif.date).toEqual(new Date(2022, 1, 31, 17, 0))
    })

    it('should offset by 7 when offset is unknown pattern', () => {
      const exif = new Exif(0, 0, undefined, date.getTime() / 1000, 'offset')
      expect(exif.date).toEqual(new Date(2022, 1, 31, 3, 0))
    })

    it('should set default date when timestamp is NaN', () => {
      const exif = new Exif(0, 0, undefined, NaN)
      expect(exif.date).toEqual(new Date(0))
    })

    it('should set default date when timestamp is Infinity', () => {
      const exif = new Exif(0, 0, undefined, Infinity)
      expect(exif.date).toEqual(new Date(0))
    })

    it('should set default date when timestamp is undefined', () => {
      const exif = new Exif(0, 0, undefined, undefined)
      expect(exif.date).toEqual(new Date(0))
    })
  })
})
