export const encoder = new TextEncoder();
export const decoder = new TextDecoder();

export function isObject(obj: unknown): obj is Record<string, unknown> {
  return (
    obj !== null && typeof obj === "object" && Array.isArray(obj) === false
  );
}
