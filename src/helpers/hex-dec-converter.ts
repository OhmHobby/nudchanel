export class HexDecConverter {
  private static readonly hexRadix = 16

  static hexToDec(hex: string) {
    return parseInt(hex.slice(1), this.hexRadix)
  }

  static decToHex(dec: number) {
    const fixLength = 6
    return `#${dec.toString(this.hexRadix).padStart(fixLength, '0')}`
  }
}
