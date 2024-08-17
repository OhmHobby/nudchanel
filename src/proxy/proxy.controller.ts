import { All, Controller, Next, NotFoundException, Param, RawBodyRequest, Req, Res } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import { NextFunction, Request, Response } from 'express'
import { ProxyService } from './proxy.service'

@Controller()
@ApiExcludeController()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('/graphql')
  proxyGraphQL(@Req() req: RawBodyRequest<Request>, @Res() res: Response, @Next() next: NextFunction) {
    const requestHandler = this.proxyService.getRequestHandler('graphql')
    if (requestHandler) {
      return requestHandler(req, res, next)
    } else {
      throw new NotFoundException()
    }
  }

  @All('/api/:service/*')
  proxyApi(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
    @Next() next: NextFunction,
    @Param('service') service: string,
  ) {
    const requestHandler = this.proxyService.getRequestHandler(service)
    if (requestHandler) {
      return requestHandler(req, res, next)
    } else {
      throw new NotFoundException()
    }
  }
}
