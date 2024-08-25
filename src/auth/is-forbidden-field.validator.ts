import { Injectable, Logger } from '@nestjs/common'
import { User } from '@nudchannel/auth'
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { ClsService } from 'nestjs-cls'

@ValidatorConstraint({ name: 'IsForbiddenFieldConstraint', async: true })
@Injectable()
export class IsForbiddenField implements ValidatorConstraintInterface {
  private readonly logger = new Logger(IsForbiddenField.name)

  constructor(private readonly cls: ClsService) {}

  validate(value: any, args?: ValidationArguments) {
    const user = this.cls.get<User>(User.name)
    const allowGroups: string[] = args?.constraints ?? []
    const isAuthorized = user.isAuthorized(...allowGroups)

    return isAuthorized
  }

  defaultMessage(validationArguments: ValidationArguments): string {
    const field = validationArguments.property

    return `${field} is forbidden`
  }
}
