import { PhotoUrlHelper } from './photo-url.helper'

describe(PhotoUrlHelper.name, () => {
  describe(PhotoUrlHelper.cover.name, () => {
    it('should return default cover correctly', () => {
      const result = PhotoUrlHelper.cover()
      expect(result).toBe('https://photos.nudchannel.com/photos/cover/00000000-0000-0000-0000-000000000000.jpg')
    })

    it('should return cover correctly', () => {
      const result = PhotoUrlHelper.cover('991560ed-85cd-4cc0-b9d3-de996765ba2d')
      expect(result).toBe('https://photos.nudchannel.com/photos/cover/991560ed-85cd-4cc0-b9d3-de996765ba2d.jpg')
    })
  })
})
