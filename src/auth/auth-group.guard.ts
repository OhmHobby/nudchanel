import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RequestWithCtx } from 'src/interfaces/request.interface'
import { AUTH_GROUP_KEY } from './auth-group.decorator'

@Injectable()
export class AuthGroupGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const groups = this.reflector.get<string[]>(AUTH_GROUP_KEY, context.getHandler())
    if (groups === undefined) {
      return true
    }
    const { user }: RequestWithCtx = context.switchToHttp().getRequest()
    return user.isAuthorizedOrThrow(...groups)
  }
}
