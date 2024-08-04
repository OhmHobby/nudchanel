import { HttpStatus } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test } from '@nestjs/testing'
import { User } from '@nudchannel/auth'
import { HttpLoggingInterceptor } from './http-logging.interceptor'

describe(HttpLoggingInterceptor.name, () => {
  let interceptor: HttpLoggingInterceptor
  let logger: jest.SpyInstance

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [HttpLoggingInterceptor, Reflector],
    }).compile()

    interceptor = module.get(HttpLoggingInterceptor)
    logger = jest.spyOn(interceptor.logger, 'log')
    logger.mockReset()
  })

  it('should be defined', () => {
    expect(interceptor).toBeDefined()
  })

  it('should log correctly', () => {
    interceptor.log(Date.now(), { user: new User() } as any)
    expect(logger).toHaveBeenCalledTimes(1)
    expect(logger).toHaveBeenCalledWith(expect.objectContaining({ status: undefined, userId: undefined }))
  })

  it('should log with response status code', () => {
    interceptor.log(Date.now(), undefined, { statusCode: HttpStatus.OK } as any)
    expect(logger).toHaveBeenCalledTimes(1)
    expect(logger).toHaveBeenCalledWith(expect.objectContaining({ status: HttpStatus.OK }))
  })

  it('should log with error status code', () => {
    interceptor.log(
      Date.now(),
      undefined,
      { statusCode: HttpStatus.OK } as any,
      { getStatus: () => HttpStatus.NOT_FOUND } as any,
    )
    expect(logger).toHaveBeenCalledWith(expect.objectContaining({ status: HttpStatus.NOT_FOUND }))
  })

  it('should log with exception', () => {
    interceptor.log(Date.now(), undefined, { statusCode: HttpStatus.OK } as any, {} as any)
    expect(logger).toHaveBeenCalledWith(expect.objectContaining({ status: HttpStatus.INTERNAL_SERVER_ERROR }))
  })
})
