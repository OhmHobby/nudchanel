import { Injectable } from '@nestjs/common'
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { HaveIBeenPwnedService } from './have-i-been-pwned.service'

@ValidatorConstraint({ name: 'IsPwnedPasswordConstraint', async: true })
@Injectable()
export class IsPwnedPasswordConstraint implements ValidatorConstraintInterface {
  async validate(value: string): Promise<boolean> {
    const isPwned = await HaveIBeenPwnedService.isPwnedPassword(value)
    return !isPwned
  }

  defaultMessage(): string {
    return `Password has been pwned`
  }
}
