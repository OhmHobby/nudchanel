import { UploadTaskRuleNoDuplication } from './upload-task-rule-no-duplication'

describe(UploadTaskRuleNoDuplication.name, () => {
  it('getValue', () => {
    expect(new UploadTaskRuleNoDuplication().getValue()).toBe(undefined)
  })

  it('isValid = true', () => {
    expect(new UploadTaskRuleNoDuplication(['NO_DUP']).isValid()).toBe(true)
  })

  it('isValid = false', () => {
    expect(new UploadTaskRuleNoDuplication().isValid()).toBe(false)
  })
})
