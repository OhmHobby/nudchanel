export type PhotoSizeString = keyof typeof PhotoSize

export enum PhotoSize {
  tiny = 10,
  thumbnail = 220,
  card = 480,
  cover = 1200,
  preview = 2160,
}
