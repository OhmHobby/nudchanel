export abstract class UploadTaskRuleAbstract<T = boolean> {
  abstract readonly pattern: RegExp

  constructor(private readonly rules: string[] = []) {}

  get rule() {
    return this.rules.find((rule) => this.pattern.test(rule))
  }

  getValue(): T | undefined {
    return undefined
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isValid(value?: any): boolean {
    return !!this.rule
  }
}
