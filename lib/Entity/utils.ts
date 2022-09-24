import { getDynamodeStorage } from '@lib/Storage';

export function addPrefixSuffix(prefix: string, value: string, suffix: string): string {
  return [prefix, value, suffix].filter((p) => p).join(getDynamodeStorage().separator);
}

export function truncatePrefixSuffix(prefix: string, value: string, suffix: string): string {
  return value.replace(`${prefix}${getDynamodeStorage().separator}`, '').replace(`${getDynamodeStorage().separator}${suffix}`, '');
}
