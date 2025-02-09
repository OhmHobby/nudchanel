import { HexDecConverter } from './hex-dec-converter'

describe(HexDecConverter.name, () => {
  describe(HexDecConverter.decToHex.name, () => {
    test('0 to #000000', () => {
      expect(HexDecConverter.decToHex(0)).toBe('#000000')
    })

    test('16777215 to #FFFFFF', () => {
      expect(HexDecConverter.decToHex(16777215)).toBe('#ffffff')
    })
  })

  describe(HexDecConverter.hexToDec.name, () => {
    test('#000000 to 0', () => {
      expect(HexDecConverter.hexToDec('#000000')).toBe(0)
    })

    test('#FFFFFF to 16777215', () => {
      expect(HexDecConverter.hexToDec('#ffffff')).toBe(16777215)
    })
  })
})
