import { IsStrongPasswordOptions } from 'class-validator'

export const STRONG_PASSWORD_OPTIONS: IsStrongPasswordOptions = {
  minLength: 10,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
}
