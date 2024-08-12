import { ClsModuleFactoryOptions } from 'nestjs-cls'
import { uuidv4 } from 'uuidv7'

export const clsConfigFactory = (): ClsModuleFactoryOptions => ({
  middleware: { mount: true, generateId: true, idGenerator: uuidv4 },
})
