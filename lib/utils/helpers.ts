export function checkDuplicatesInArray(arr: Array<unknown>): boolean {
  return new Set(arr).size !== arr.length;
}

export function isEmpty(obj: object) {
  return Object.keys(obj).length === 0;
}
