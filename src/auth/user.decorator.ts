import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { RequestWithCtx } from 'src/interfaces/request.interface'

export const UserCtx = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const request = <RequestWithCtx>ctx.switchToHttp().getRequest()
  return request.user
})
