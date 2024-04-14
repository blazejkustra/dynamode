import { decorateAttribute } from '@lib/decorators/helpers/decorateAttribute';
import { PrefixSuffixOptions } from '@lib/decorators/types';

export function string(
  options?: PrefixSuffixOptions,
): <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(String, 'attribute', options);
}

export function number(): <T extends Partial<Record<K, number>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(Number, 'attribute');
}

export function binary(): <T extends Partial<Record<K, Uint8Array>>, K extends string>(
  Entity: T,
  propertyName: K,
) => void {
  return decorateAttribute(Uint8Array, 'attribute');
}

export function boolean(): <T extends Partial<Record<K, boolean>>, K extends string>(
  Entity: T,
  propertyName: K,
) => void {
  return decorateAttribute(Boolean, 'attribute');
}

export function object(): <T extends Partial<Record<K, Record<string, unknown>>>, K extends string>(
  Entity: T,
  propertyName: K,
) => void {
  return decorateAttribute(Object, 'attribute');
}

export function array(): <T extends Partial<Record<K, Array<unknown>>>, K extends string>(
  Entity: T,
  propertyName: K,
) => void {
  return decorateAttribute(Array, 'attribute');
}

export function set(): <T extends Partial<Record<K, Set<string | number>>>, K extends string>(
  Entity: T,
  propertyName: K,
) => void {
  return decorateAttribute(Set, 'attribute');
}

export function map(): <T extends Partial<Record<K, Map<unknown, unknown>>>, K extends string>(
  Entity: T,
  propertyName: K,
) => void {
  return decorateAttribute(Map, 'attribute');
}
