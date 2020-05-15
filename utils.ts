export function isObject(obj: unknown): obj is object {
  return obj !== null && typeof obj === "object" && Array.isArray(obj) === false
}

export function has<K extends string>(
  key: K,
  x: object
): x is { [key in K]: unknown } {
  return key in x
}

/*
 * Helper function: setExpiration()
 * returns the number of milliseconds since January 1, 1970, 00:00:00 UTC
 */
export function setExpiration(exp: number | Date): number {
  return (exp instanceof Date ? exp : new Date(exp)).getTime()
}

export function isExpired(exp: number, leeway = 0): boolean {
  return new Date(exp + leeway) < new Date()
}
