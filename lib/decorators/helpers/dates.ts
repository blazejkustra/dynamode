import { decorateAttribute } from '@lib/decorators/helpers/decorateAttribute';
import { PrefixSuffixOptions } from '@lib/decorators/types';

export function stringDate(
  options?: PrefixSuffixOptions,
): <T extends Partial<Record<K, Date>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(String, 'date', options);
}

export function numberDate(): <T extends Partial<Record<K, Date>>, K extends string>(
  Entity: T,
  propertyName: K,
) => void {
  return decorateAttribute(Number, 'date');
}
