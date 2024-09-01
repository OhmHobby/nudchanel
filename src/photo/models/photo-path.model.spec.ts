import { DEFAULT_UUID } from 'src/constants/uuid.constants'
import { ImageFit } from 'src/enums/image-fit.enum'
import { ImageFormat } from 'src/enums/image-format.enum'
import { PhotoSize } from 'src/enums/photo-size.enum'
import { PhotoPath } from './photo-path.model'

describe(PhotoPath.name, () => {
  test('sizeFormat', () => {
    expect(new PhotoPath(PhotoSize.preview, DEFAULT_UUID).sizeFormat).toBe(ImageFormat.webp)
    expect(new PhotoPath(PhotoSize.cover, DEFAULT_UUID).sizeFormat).toBe(ImageFormat.jpeg)
    expect(new PhotoPath(PhotoSize.card, DEFAULT_UUID).sizeFormat).toBe(ImageFormat.webp)
    expect(new PhotoPath(PhotoSize.thumbnail, DEFAULT_UUID).sizeFormat).toBe(ImageFormat.webp)
  })

  test('mime', () => {
    expect(new PhotoPath(PhotoSize.preview, DEFAULT_UUID, ImageFormat.jpeg).mime).toBe('image/jpeg')
    expect(new PhotoPath(PhotoSize.preview, DEFAULT_UUID, ImageFormat.webp).mime).toBe('image/webp')
  })

  test('requestPath', () => {
    const result = new PhotoPath(PhotoSize.preview, DEFAULT_UUID, ImageFormat.webp).requestPath
    expect(result).toBe('minio://preview/00000000-0000-0000-0000-000000000000.webp')
  })

  test('sourcePath', () => {
    const result = new PhotoPath(PhotoSize.preview, DEFAULT_UUID, ImageFormat.jpeg).sourcePath
    expect(result).toBe('minio://preview/00000000-0000-0000-0000-000000000000.webp')
  })

  test('isRequestASource', () => {
    expect(new PhotoPath(PhotoSize.preview, DEFAULT_UUID, ImageFormat.jpeg).isRequestASource).toBe(false)
    expect(new PhotoPath(PhotoSize.preview, DEFAULT_UUID, ImageFormat.webp).isRequestASource).toBe(true)
  })

  describe('buildProcessParams', () => {
    test('card', () => {
      const result = new PhotoPath(PhotoSize.card, DEFAULT_UUID, ImageFormat.webp).buildProcessParams()
      expect(result.format).toBe(ImageFormat.webp)
      expect(result.width).toBe(PhotoSize.card)
      expect(result.height).toBe(PhotoSize.card)
      expect(result.fit).toBe(ImageFit.inside)
      expect(result.quality).toBe(80)
      expect(result.watermark).toBeUndefined
    })

    test('thumbnail', () => {
      const result = new PhotoPath(PhotoSize.thumbnail, DEFAULT_UUID).buildProcessParams()
      expect(result.format).toBe(ImageFormat.webp)
      expect(result.width).toBe(PhotoSize.thumbnail)
      expect(result.height).toBe(PhotoSize.thumbnail)
      expect(result.fit).toBe(ImageFit.outside)
      expect(result.quality).toBe(80)
      expect(result.watermark).toBeUndefined
    })
  })

  describe('nextFallback', () => {
    test('thumbnail jpg', () => {
      const result = new PhotoPath(PhotoSize.thumbnail, DEFAULT_UUID, ImageFormat.jpeg).nextFallback()
      expect(result?.requestPath).toBe('minio://thumbnail/00000000-0000-0000-0000-000000000000.webp')
    })

    test('thumbnail webp', () => {
      const result = new PhotoPath(PhotoSize.thumbnail, DEFAULT_UUID, ImageFormat.webp).nextFallback()
      expect(result?.requestPath).toBe('minio://preview/00000000-0000-0000-0000-000000000000.webp')
    })

    test('card webp', () => {
      const result = new PhotoPath(PhotoSize.card, DEFAULT_UUID, ImageFormat.webp).nextFallback()
      expect(result?.requestPath).toBe('minio://preview/00000000-0000-0000-0000-000000000000.webp')
    })

    test('preview jpg', () => {
      const result = new PhotoPath(PhotoSize.preview, DEFAULT_UUID, ImageFormat.jpeg).nextFallback()
      expect(result?.requestPath).toBe('minio://preview/00000000-0000-0000-0000-000000000000.webp')
    })

    test('preview webp', () => {
      const result = new PhotoPath(PhotoSize.preview, DEFAULT_UUID, ImageFormat.webp).nextFallback()
      expect(result?.requestPath).toBeUndefined()
    })
  })

  test('fromGetPhotoDto', () => {
    const result = PhotoPath.fromGetPhotoDto({ size: PhotoSize.card, uuid: DEFAULT_UUID, ext: 'jpg' })
    expect(result).toEqual(new PhotoPath(PhotoSize.card, DEFAULT_UUID, ImageFormat.jpeg))
  })
})
