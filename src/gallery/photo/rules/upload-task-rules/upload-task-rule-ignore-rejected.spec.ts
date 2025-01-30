import { UploadTaskRuleIgnoreRejected } from './upload-task-rule-ignore-rejected'

describe(UploadTaskRuleIgnoreRejected.name, () => {
  it('getValue', () => {
    expect(new UploadTaskRuleIgnoreRejected().getValue()).toBe(undefined)
  })

  it('isValid = true', () => {
    expect(new UploadTaskRuleIgnoreRejected(['IGNORE_REJECTED']).isValid()).toBe(true)
  })

  it('isValid = false', () => {
    expect(new UploadTaskRuleIgnoreRejected().isValid()).toBe(false)
  })
})
