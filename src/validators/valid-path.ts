import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'

@ValidatorConstraint()
export class ValidPath implements ValidatorConstraintInterface {
  isValidPath(value: string) {
    const reserveChars = ['\\', ':', '*', '?', '"', '<', '>', '|']
    return !reserveChars.some((char) => value.includes(char))
  }

  isValidPattern(args: ValidationArguments) {
    return args.constraints.every((regex: RegExp) => regex.test(args.value))
  }

  validate(value: string, args: ValidationArguments) {
    return this.isValidPath(value) && this.isValidPattern(args)
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is not a valid path`
  }
}
