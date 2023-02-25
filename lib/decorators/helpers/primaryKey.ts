import { decorateAttribute } from '@lib/decorators/helpers/decorateAttribute';
import { PrefixSuffixOptions } from '@lib/decorators/types';

export function stringPartitionKey(
  options?: PrefixSuffixOptions,
): <T extends Record<K, string>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(String, 'partitionKey', options);
}

export function numberPartitionKey(): <T extends Record<K, number>, K extends string>(
  Entity: T,
  propertyName: K,
) => void {
  return decorateAttribute(Number, 'partitionKey');
}

export function stringSortKey(
  options?: PrefixSuffixOptions,
): <T extends Record<K, string>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(String, 'sortKey', options);
}

export function numberSortKey(): <T extends Record<K, number>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(Number, 'sortKey');
}
