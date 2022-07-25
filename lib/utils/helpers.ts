export function checkDuplicatesInArray(arr: Array<unknown>): boolean {
  return new Set(arr).size !== arr.length;
}
