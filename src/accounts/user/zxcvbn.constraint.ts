import { Injectable } from '@nestjs/common'
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import zxcvbn from 'zxcvbn'

@ValidatorConstraint({ name: 'PasswordStrengthConstraint', async: false })
@Injectable()
export class PasswordStrengthConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    const result = zxcvbn(value)
    return result.score > 0 && !result.feedback.warning
  }

  defaultMessage(args: ValidationArguments): string {
    return `Password is not strong enough: (${zxcvbn(args.value).feedback.warning})`
  }
}
