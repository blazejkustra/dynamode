import { decorateAttribute } from '@lib/decorators/helpers/decorateAttribute';
import { IndexDecoratorOptions, PrefixSuffixOptions } from '@lib/decorators/types';

export function stringLsiSortKey(
  options: IndexDecoratorOptions & PrefixSuffixOptions,
): <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(String, 'lsiSortKey', options);
}

export function numberLsiSortKey(
  options: IndexDecoratorOptions,
): <T extends Partial<Record<K, number>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(Number, 'lsiSortKey', options);
}
