import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import dayjs from 'dayjs'
import { ValidBeforeAfterDateOption } from './valid-before-after-date-option.type'

@ValidatorConstraint()
export class ValidBeforeAfterDate implements ValidatorConstraintInterface {
  private getCompareKey(args: ValidationArguments) {
    const compareValue = args.constraints[0](args.object)
    return Object.entries(args.object)
      .find(([, v]) => v === compareValue && v !== args.property)
      ?.at(0)
  }

  private getDiffDays(args: ValidationArguments) {
    const value = dayjs(args.object[args.property])
    const compareValue = dayjs(args.constraints[0](args.object))
    const diffDays = value.diff(compareValue, 'days', true)
    return diffDays
  }

  private getMinRange(args: ValidationArguments): number {
    return (args.constraints[1] as ValidBeforeAfterDateOption).minDay
  }

  private getMaxRange(args: ValidationArguments): number {
    return (args.constraints[1] as ValidBeforeAfterDateOption).maxDay
  }

  private isMoreThanMinRange(args: ValidationArguments) {
    const diffDays = this.getDiffDays(args)
    const minRange = this.getMinRange(args)
    return minRange <= diffDays
  }

  private isLessThanMaxRange(args: ValidationArguments) {
    const diffDays = this.getDiffDays(args)
    const maxRange = this.getMaxRange(args)
    return diffDays <= maxRange
  }

  validate(_: any, args: ValidationArguments) {
    return this.isMoreThanMinRange(args) && this.isLessThanMaxRange(args)
  }

  defaultMessage(args: ValidationArguments) {
    return this.isMoreThanMinRange(args)
      ? `${args.property} should not more than ${this.getMaxRange(args)} days compare to ${this.getCompareKey(args)}`
      : `${args.property} should not less than ${-this.getMinRange(args)} days compare to ${this.getCompareKey(args)}`
  }
}
