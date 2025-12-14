export function toPrismaJson<T>(value: T) {
  return JSON.parse(JSON.stringify(value));
}
