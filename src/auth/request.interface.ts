import { User } from '@nudchannel/auth'
import { Request as ExpressRequest } from 'express'

export interface Request extends ExpressRequest {
  user: User
}
