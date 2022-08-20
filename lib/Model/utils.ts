import { TimestampsType } from '@lib/Table';
import { SEPARATOR } from '@lib/utils';

export function addPrefixSuffix(prefix: string, value: string, suffix: string): string {
  return [prefix, value, suffix].filter((p) => p).join(SEPARATOR);
}

export function truncatePrefixSuffix(prefix: string, value: string, suffix: string): string {
  return value.replace(`${prefix}${SEPARATOR}`, '').replace(`${SEPARATOR}${suffix}`, '');
}

export function getTimestampValue(date: Date, type: TimestampsType): string | number | undefined {
  if (type === TimestampsType.EPOCH) {
    return date.getTime();
  }
  if (type === TimestampsType.ISO8601) {
    return date.toISOString();
  }
  return undefined;
}
