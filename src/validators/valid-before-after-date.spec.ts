import { ValidationArguments } from 'class-validator'
import { ValidBeforeAfterDate } from './valid-before-after-date'

describe(ValidBeforeAfterDate.name, () => {
  let validator: ValidBeforeAfterDate

  beforeEach(() => {
    validator = new ValidBeforeAfterDate()
  })

  const argsBuilder = (after: Date, before: Date, minDay: number, maxDay: number): ValidationArguments => ({
    constraints: [(o) => o.before, { minDay, maxDay }],
    object: { after, before },
    property: 'after',
    targetName: '',
    value: after,
  })

  it('should pass when range is 2023-09-01 - 2023-09-03', () => {
    const takenAfter = new Date('2023-09-01')
    const takenBefore = new Date('2023-09-03')
    const result = validator.validate(null, argsBuilder(takenAfter, takenBefore, -30, 0))
    expect(result).toBe(true)
  })

  it('should fail when range is 2023-09-01T02:00 - 2023-09-01T01:00', () => {
    const takenAfter = new Date('2023-09-01T02:00')
    const takenBefore = new Date('2023-09-01T01:00')
    const args = argsBuilder(takenAfter, takenBefore, -30, 0)
    const result = validator.validate(null, args)
    expect(result).toBe(false)
    const message = validator.defaultMessage(args)
    expect(message).toContain('more than')
  })

  it('should fail when range is 2023-01-01 - 2023-12-01', () => {
    const takenAfter = new Date('2023-01-01')
    const takenBefore = new Date('2023-12-01')
    const args = argsBuilder(takenAfter, takenBefore, -30, 0)
    const result = validator.validate(null, args)
    expect(result).toBe(false)
    const message = validator.defaultMessage(args)
    expect(message).toContain('less than')
  })
})
