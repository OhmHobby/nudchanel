import { Injectable, Logger } from '@nestjs/common'
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import zxcvbn from 'zxcvbn'

@ValidatorConstraint({ name: 'PasswordStrengthConstraint', async: false })
@Injectable()
export class PasswordStrengthConstraint implements ValidatorConstraintInterface {
  private readonly logger = new Logger(PasswordStrengthConstraint.name)

  validate(value: string) {
    const result = zxcvbn(value)
    return result.score > 0 && !result.feedback.warning
  }

  defaultMessage(args: ValidationArguments): string {
    this.logger.warn({
      message: `Password is not strong enough: ${zxcvbn(args.value).feedback.warning || 'Password score is too low'}`,
      warning: zxcvbn(args.value).feedback.warning,
      score: zxcvbn(args.value).score,
    })
    return `Password is not strong enough: ${zxcvbn(args.value).feedback.warning || 'Password score is too low'}`
  }
}
