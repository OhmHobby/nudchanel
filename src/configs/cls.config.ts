import { User } from '@nudchannel/auth'
import { ClsModuleFactoryOptions } from 'nestjs-cls'
import { Request } from 'src/auth/request.interface'
import { uuidv4 } from 'uuidv7'

export const clsConfigFactory = (): ClsModuleFactoryOptions => ({
  middleware: {
    mount: true,
    generateId: true,
    idGenerator: uuidv4,
    setup: (cls, req: Request) => {
      cls.set(User.name, req.user)
    },
  },
})
