import { Injectable } from '@nestjs/common'
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'

@ValidatorConstraint({ name: 'PasswordCharacterConstraint', async: false })
@Injectable()
export class PasswordCharacterConstraint implements ValidatorConstraintInterface {
  private readonly minLength = 10

  private readonly minLowercase = 1

  private readonly minUppercase = 1

  private readonly minNumbers = 1

  private readonly minSymbols = 1

  validate(value: string) {
    return (
      this.validateLength(value) &&
      this.validateLowercase(value) &&
      this.validateUppercase(value) &&
      this.validateNumbers(value) &&
      this.validateSymbols(value)
    )
  }

  defaultMessage(args: ValidationArguments): string {
    if (this.validateLength(args.value)) {
      return `Password requires at least ${this.minLength} character(s)`
    }

    if (this.validateLowercase(args.value)) {
      return `Password requires at least ${this.minLowercase} lowercase character(s)`
    }

    if (this.validateUppercase(args.value)) {
      return `Password requires at least ${this.minUppercase} uppercase character(s)`
    }

    if (this.validateNumbers(args.value)) {
      return `Password requires at least ${this.minNumbers} number(s)`
    }

    if (this.validateSymbols(args.value)) {
      return `Password requires at least ${this.minSymbols} symbol(s)`
    }

    return `Password is not strong enough`
  }

  private validateLength(value: string): boolean {
    return value.length >= this.minLength
  }

  private validateLowercase(value: string): boolean {
    return value.length >= this.minLowercase
  }

  private validateUppercase(value: string): boolean {
    return value.length >= this.minUppercase
  }

  private validateNumbers(value: string): boolean {
    return value.length >= this.minNumbers
  }

  private validateSymbols(value: string): boolean {
    return value.length >= this.minSymbols
  }
}
