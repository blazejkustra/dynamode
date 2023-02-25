import { decorateAttribute } from '@lib/decorators/helpers/decorateAttribute';
import { IndexDecoratorOptions, PrefixSuffixOptions } from '@lib/decorators/types';

export function stringGsiPartitionKey(
  options: IndexDecoratorOptions & PrefixSuffixOptions,
): <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(String, 'gsiPartitionKey', options);
}

export function numberGsiPartitionKey(
  options: IndexDecoratorOptions,
): <T extends Partial<Record<K, number>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(Number, 'gsiPartitionKey', options);
}

export function stringGsiSortKey(
  options: IndexDecoratorOptions & PrefixSuffixOptions,
): <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(String, 'gsiSortKey', options);
}

export function numberGsiSortKey(
  options: IndexDecoratorOptions,
): <T extends Partial<Record<K, number>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(Number, 'gsiSortKey', options);
}
