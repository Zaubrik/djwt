export const encoder = new TextEncoder();
export const decoder = new TextDecoder();

export function isArray<T>(input: T[] | unknown): input is T[] {
  return Array.isArray(input);
}

export function isDefined<T>(input: T | undefined): input is T {
  return input !== undefined;
}

export function isNotNull<T>(input: T | null): input is T {
  return input !== null;
}

export function isNotNumber<T>(input: T | number): input is T {
  return typeof input !== "number";
}

export function isNotString<T>(input: T | string): input is T {
  return typeof input !== "string";
}

export function isNull(input: unknown): input is null {
  return input === null;
}

export function isNumber(input: unknown): input is number {
  return typeof input === "number";
}

export function isObject(input: unknown): input is Record<string, unknown> {
  return (
    input !== null && typeof input === "object" &&
    Array.isArray(input) === false
  );
}

export function isString(input: unknown): input is string {
  return typeof input === "string";
}

export function isUndefined(input: unknown): input is undefined {
  return input === undefined;
}
