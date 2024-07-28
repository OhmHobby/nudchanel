/* eslint-disable max-classes-per-file */
let isEnabled: boolean
jest.mock('config', () => {
  return {
    __esModule: true, // for esModules
    get: jest.fn(() => {
      return isEnabled
    }),
  }
})
import { Processor } from '@nestjs/bull'
import { BullProcessorProviderHelper } from './bull-processor-provider.helper'

describe(BullProcessorProviderHelper.name, () => {
  @Processor('test')
  class ProcessorService {}

  class NonProcessorService {}

  describe(BullProcessorProviderHelper.filterEnabled.name, () => {
    describe('enabled setting', () => {
      it('should return true when class is processor', () => {
        isEnabled = true
        const result = BullProcessorProviderHelper.filterEnabled(ProcessorService)
        expect(result).toBe(true)
      })

      it('should return true when class is non-processor', () => {
        isEnabled = true
        const result = BullProcessorProviderHelper.filterEnabled(NonProcessorService)
        expect(result).toBe(true)
      })
    })

    describe('disabled setting', () => {
      it('should return false when class is processor', () => {
        isEnabled = false
        const result = BullProcessorProviderHelper.filterEnabled(ProcessorService)
        expect(result).toBe(false)
      })

      it('should return true when class is non-processor', () => {
        isEnabled = false
        const result = BullProcessorProviderHelper.filterEnabled(NonProcessorService)
        expect(result).toBe(true)
      })
    })
  })
})
