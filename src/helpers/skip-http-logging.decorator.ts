export const SKIP_HTTP_LOGGING = 'SKIP_HTTP_LOGGING'

export function SkipHttpLogging() {
  return (target: any, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
    if (descriptor) {
      Reflect.defineMetadata(SKIP_HTTP_LOGGING, true, descriptor.value)
      return descriptor
    }
    Reflect.defineMetadata(SKIP_HTTP_LOGGING, true, target)
    return target
  }
}
