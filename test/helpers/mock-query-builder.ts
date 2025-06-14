import { SelectQueryBuilder } from 'typeorm'

export const mockQueryBuilder = (obj: Partial<SelectQueryBuilder<any>>): Partial<SelectQueryBuilder<any>> => ({
  ...obj,
  select: jest.fn().mockReturnThis(),
  distinct: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
})
