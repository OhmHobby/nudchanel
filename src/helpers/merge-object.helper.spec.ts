import { mergeObject } from './merge-object.helper'

describe('mergeObject helper', () => {
  it('should merge with ignore undefined correctly', () => {
    const target = { id: 1, name: 'Alice', age: 30, email: 'test@email.com' }
    const source = { name: undefined, age: null, city: 'New York', email: undefined, isActive: false }

    mergeObject(target, source)

    expect(target).toEqual({
      id: 1,
      name: 'Alice',
      age: null,
      city: 'New York',
      email: 'test@email.com',
      isActive: false,
    })
  })
})
