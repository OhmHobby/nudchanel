import { ImageFit } from 'src/enums/image-fit.enum'
import { ProcessPhotoParams } from './process-photo-params'

describe(ProcessPhotoParams.name, () => {
  describe(ProcessPhotoParams.prototype.buildResizeOptions.name, () => {
    it('should return default correctly', () => {
      const result = new ProcessPhotoParams({ width: 800, height: 600 }).buildResizeOptions()
      expect(result.width).toBe(800)
      expect(result.height).toBe(600)
      expect(result.fit).toBe(ImageFit.inside)
      expect(result.withoutEnlargement).toBe(true)
    })
  })

  describe(ProcessPhotoParams.prototype.buildPreExtractRegion.name, () => {
    test('no resize request (default)', () => {
      const result = new ProcessPhotoParams().buildPreExtractRegion(800, 600)
      expect(result).toEqual({ width: 800, height: 600, top: 0, left: 0 })
    })

    test('from original landscape to square with width ratio 0', () => {
      const result = new ProcessPhotoParams({ width: 256, height: 256, widthRatio: 0 }).buildPreExtractRegion(800, 600)
      expect(result).toEqual({ width: 600, height: 600, top: 0, left: 0 })
    })

    test('from original landscape to square with width ratio 0.5', () => {
      const result = new ProcessPhotoParams({ width: 256, height: 256 }).buildPreExtractRegion(800, 600)
      expect(result).toEqual({ width: 600, height: 600, top: 0, left: 100 })
    })

    test('from original landscape to square with width ratio 1', () => {
      const result = new ProcessPhotoParams({ width: 256, height: 256, widthRatio: 1 }).buildPreExtractRegion(800, 600)
      expect(result).toEqual({ width: 600, height: 600, top: 0, left: 200 })
    })

    test('from original portrait to square with height ratio 0', () => {
      const result = new ProcessPhotoParams({ width: 256, height: 256, heightRatio: 0 }).buildPreExtractRegion(600, 800)
      expect(result).toEqual({ width: 600, height: 600, top: 0, left: 0 })
    })

    test('from original portrait to square with height ratio 0.5', () => {
      const result = new ProcessPhotoParams({ width: 256, height: 256 }).buildPreExtractRegion(600, 800)
      expect(result).toEqual({ width: 600, height: 600, top: 100, left: 0 })
    })

    test('from original portrait to square with height ratio 1', () => {
      const result = new ProcessPhotoParams({ width: 256, height: 256, heightRatio: 1 }).buildPreExtractRegion(600, 800)
      expect(result).toEqual({ width: 600, height: 600, top: 200, left: 0 })
    })
  })
})
