export function duplicatesInArray(arr: Array<unknown>): boolean {
  return new Set(arr).size !== arr.length;
}

export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

export function isNotEmpty(obj?: object): obj is object {
  if (!obj) return false;
  return !isEmpty(obj);
}

export function isNotEmptyString(str: string) {
  if (str === '') return false;
  return true;
}

export function isNotEmptyArray<T>(array?: Array<T>): array is Array<T> {
  return !!array && array.length > 0;
}

export function insertBetween<T>(arr: T[], separator: T | T[]): T[] {
  return arr.flatMap((value, index, array) =>
    array.length - 1 !== index // check for the last item
      ? Array.isArray(separator)
        ? [value, ...separator]
        : [value, separator]
      : value,
  );
}

export function deepEqual(obj1: any, obj2: any): boolean {
  // Check if the objects are strictly equal
  if (obj1 === obj2) {
    return true;
  }

  // Check if both objects are objects and not null
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  // Get the keys of the objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Check if the objects have the same number of properties
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Check if all properties are deep equal
  for (const key of keys1) {
    if (!deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

/** Splits key that reference a list element.
 * Alphanumeric part can be replaced in case it is a DynamoDB reserved word.
 * Examples: 'list[0][1]' -> ['list', '[0][1]']. 'auto[10]' -> ['auto', '[10]'] */
export function splitListPathReference(key: string): [string, string] {
  const index = key.search(/\[\d+\]/g);

  if (index === -1) {
    return [key, ''];
  }

  return [key.slice(0, index), key.slice(index)];
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
