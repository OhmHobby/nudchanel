import { HttpStatus } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test } from '@nestjs/testing'
import { User } from '@nudchannel/auth'
import { HttpLoggingInterceptor } from './http-logging.interceptor'

describe(HttpLoggingInterceptor.name, () => {
  const controllerName = 'testController'
  const handlerName = 'handler'

  let interceptor: HttpLoggingInterceptor
  let loggerInfo: jest.SpyInstance
  let loggerWarn: jest.SpyInstance
  let loggerError: jest.SpyInstance

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [HttpLoggingInterceptor, Reflector],
    }).compile()

    interceptor = module.get(HttpLoggingInterceptor)
    loggerInfo = jest.spyOn(interceptor.logger, 'log')
    loggerWarn = jest.spyOn(interceptor.logger, 'warn')
    loggerError = jest.spyOn(interceptor.logger, 'error')
    loggerInfo.mockReset()
    loggerWarn.mockReset()
    loggerError.mockReset()
  })

  it('should be defined', () => {
    expect(interceptor).toBeDefined()
  })

  it('should log correctly', () => {
    interceptor.log(Date.now(), controllerName, handlerName, { user: new User() } as any)
    expect(loggerInfo).toHaveBeenCalledTimes(1)
    expect(loggerInfo).toHaveBeenCalledWith(expect.objectContaining({ status: undefined, userId: undefined }))
  })

  it('should log with response status code', () => {
    interceptor.log(Date.now(), controllerName, handlerName, undefined, { statusCode: HttpStatus.OK } as any)
    expect(loggerInfo).toHaveBeenCalledTimes(1)
    expect(loggerInfo).toHaveBeenCalledWith(expect.objectContaining({ status: HttpStatus.OK }))
  })

  it('should log with error status code', () => {
    interceptor.log(
      Date.now(),
      controllerName,
      handlerName,
      undefined,
      { statusCode: HttpStatus.OK } as any,
      { getStatus: () => HttpStatus.NOT_FOUND } as any,
    )
    expect(loggerWarn).toHaveBeenCalledWith(expect.objectContaining({ status: HttpStatus.NOT_FOUND }))
  })

  it('should log with exception', () => {
    interceptor.log(Date.now(), controllerName, handlerName, undefined, { statusCode: HttpStatus.OK } as any, {} as any)
    expect(loggerError).toHaveBeenCalledWith(expect.objectContaining({ status: HttpStatus.INTERNAL_SERVER_ERROR }))
  })
})
