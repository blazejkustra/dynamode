export function checkDuplicatesInArray(arr: Array<unknown>): boolean {
  return new Set(arr).size !== arr.length;
}

export function isEmpty(obj: object) {
  return Object.keys(obj).length === 0;
}

export function isNotEmpty(obj?: object): obj is object {
  if (!obj) return false;
  return !isEmpty(obj);
}

export function isNotEmptyArray<T>(array?: Array<T>): array is Array<T> {
  return !!array && array.length > 0;
}

/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 *
 * @param {...object} objects - Objects to merge
 * @returns {object} New object with merged key/values
 */
export function mergeObjects<T extends Record<string, unknown>>(...objects: T[]): T {
  const isObject = (obj: unknown): obj is T => !!obj && typeof obj === 'object' && !Array.isArray(obj);

  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key: keyof T) => {
      const prevValue = prev[key];
      const value = obj[key];

      if (isObject(prevValue) && isObject(value)) {
        prev[key] = mergeObjects(prevValue, value);
      } else {
        prev[key] = value;
      }
    });

    return prev;
  }, {} as T);
}

export async function timeout(ms: number): Promise<void> {
  if (ms > 0) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
