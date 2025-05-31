export function mergeObject(a: object, b: object) {
  Object.assign(a, Object.fromEntries(Object.entries(b).filter(([, v]) => v !== undefined)))
}
