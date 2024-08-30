import { DEFAULT_UUID } from 'src/constants/uuid.constants'
import { ImageFormat } from 'src/enums/image-format.enum'
import { PhotoSize } from 'src/enums/photo-size.enum'
import { ProcessPhotoParams } from '../processor/process-photo-params'
import { PhotoPath } from './photo-path.model'

describe(PhotoPath.name, () => {
  test('sizeFormat', () => {
    expect(new PhotoPath(PhotoSize.preview, DEFAULT_UUID).sizeFormat).toBe(ImageFormat.webp)
    expect(new PhotoPath(PhotoSize.cover, DEFAULT_UUID).sizeFormat).toBe(ImageFormat.jpeg)
    expect(new PhotoPath(PhotoSize.card, DEFAULT_UUID).sizeFormat).toBe(ImageFormat.jpeg)
    expect(new PhotoPath(PhotoSize.thumbnail, DEFAULT_UUID).sizeFormat).toBe(ImageFormat.webp)
  })

  test('mime', () => {
    expect(new PhotoPath(PhotoSize.preview, DEFAULT_UUID, ImageFormat.jpeg).mime).toBe('image/jpeg')
    expect(new PhotoPath(PhotoSize.preview, DEFAULT_UUID, ImageFormat.webp).mime).toBe('image/webp')
  })

  test('requestPath', () => {
    const result = new PhotoPath(PhotoSize.preview, DEFAULT_UUID, ImageFormat.webp).requestPath
    expect(result).toBe('webdav://webdev/photos/preview/00000000-0000-0000-0000-000000000000.webp')
  })

  test('sourcePath', () => {
    const result = new PhotoPath(PhotoSize.preview, DEFAULT_UUID, ImageFormat.jpeg).sourcePath
    expect(result).toBe('webdav://webdev/photos/preview/00000000-0000-0000-0000-000000000000.webp')
  })

  test('isRequestASource', () => {
    expect(new PhotoPath(PhotoSize.preview, DEFAULT_UUID, ImageFormat.jpeg).isRequestASource).toBe(false)
    expect(new PhotoPath(PhotoSize.preview, DEFAULT_UUID, ImageFormat.webp).isRequestASource).toBe(true)
  })

  test('processParams', () => {
    const result = new PhotoPath(PhotoSize.card, DEFAULT_UUID, ImageFormat.jpeg).processParams
    expect(result).toEqual(
      new ProcessPhotoParams({ format: ImageFormat.jpeg, width: PhotoSize.card, height: PhotoSize.card }),
    )
  })

  describe('nextFallback', () => {
    test('thumbnail jpg', () => {
      const result = new PhotoPath(PhotoSize.thumbnail, DEFAULT_UUID, ImageFormat.jpeg).nextFallback()
      expect(result?.requestPath).toBe('webdav://webdev/photos/thumbnail/00000000-0000-0000-0000-000000000000.webp')
    })

    test('thumbnail webp', () => {
      const result = new PhotoPath(PhotoSize.thumbnail, DEFAULT_UUID, ImageFormat.webp).nextFallback()
      expect(result?.requestPath).toBe('webdav://webdev/photos/preview/00000000-0000-0000-0000-000000000000.webp')
    })

    test('card jpg', () => {
      const result = new PhotoPath(PhotoSize.card, DEFAULT_UUID, ImageFormat.jpeg).nextFallback()
      expect(result?.requestPath).toBe('webdav://webdev/photos/preview/00000000-0000-0000-0000-000000000000.webp')
    })

    test('preview jpg', () => {
      const result = new PhotoPath(PhotoSize.preview, DEFAULT_UUID, ImageFormat.jpeg).nextFallback()
      expect(result?.requestPath).toBe('webdav://webdev/photos/preview/00000000-0000-0000-0000-000000000000.webp')
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
