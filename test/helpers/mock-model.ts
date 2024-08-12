import { ReturnModelType } from '@typegoose/typegoose'

export type MockModelType<T extends new (...args: any[]) => any> = ReturnModelType<T, Record<string, any>>

export function resetMockModel<T extends new (...args: any[]) => any>(model: MockModelType<T>) {
  model.find = jest.fn().mockReturnValue({
    or: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    distinct: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  })
  model.findOne = jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), exec: jest.fn() })
  model.findById = jest.fn().mockReturnValue({ exec: jest.fn() })
  model.countDocuments = jest.fn().mockReturnValue({ exec: jest.fn() })
  model.deleteOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) })
  model.updateOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) })
  model.create = jest.fn().mockImplementation((obj) => Promise.resolve(obj))
  return model
}
