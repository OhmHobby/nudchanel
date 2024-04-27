import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AUTH_GROUP_KEY } from './auth-group.decorator'
import { Request } from './request.interface'

@Injectable()
export class AuthGroupGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const groups = this.reflector.get<string[]>(AUTH_GROUP_KEY, context.getHandler())
    if (groups === undefined) {
      return true
    }
    const { user }: Request = context.switchToHttp().getRequest()
    return user.isAuthorizedOrThrow(...groups)
  }
}
