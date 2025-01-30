import { ValidPath } from './valid-path'

describe(ValidPath.name, () => {
  let validator: ValidPath

  beforeEach(() => {
    validator = new ValidPath()
  })

  describe(ValidPath.prototype.isValidPath.name, () => {
    it('should return true for valid path', () => {
      expect(validator.isValidPath('')).toBe(true)
      expect(validator.isValidPath('/')).toBe(true)
      expect(validator.isValidPath('/2023')).toBe(true)
      expect(validator.isValidPath('/2023/')).toBe(true)
      expect(validator.isValidPath('/2023/a test-directory.')).toBe(true)
    })

    it('should return false for valid path', () => {
      expect(validator.isValidPath('/2023:1')).toBe(false)
      expect(validator.isValidPath('/2023?')).toBe(false)
      expect(validator.isValidPath('/this is "test" directory')).toBe(false)
      expect(validator.isValidPath('/a|b')).toBe(false)
      expect(validator.isValidPath('/a*b')).toBe(false)
      expect(validator.isValidPath('/2023\\1')).toBe(false)
      expect(validator.isValidPath('/2023>2')).toBe(false)
    })
  })

  describe(ValidPath.prototype.isValidPattern.name, () => {
    const constraints = [/^\/\d{4}\/.+/]
    describe(`pattern ${constraints}`, () => {
      it.each([
        ['/', false],
        ['/test', false],
        ['/2023', false],
        ['/2023/', false],
        ['/2023/test', true],
        ['/2023/a test-directory.', true],
      ])('path %s should return %s', (value: string, expected: boolean) => {
        expect(validator.isValidPattern({ constraints, value } as any)).toBe(expected)
      })
    })
  })
})
