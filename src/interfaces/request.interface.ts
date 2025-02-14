import { User } from '@nudchannel/auth'
import { Request as ExpressRequest } from 'express'
import { RecruitContext } from 'src/recruit/context/recruit-context.model'

export interface RequestWithCtx extends ExpressRequest {
  user: User

  recruit: RecruitContext
}
