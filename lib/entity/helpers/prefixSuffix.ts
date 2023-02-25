import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import type { EntityKey } from '@lib/entity/types';

export function prefixSuffixValue<E extends typeof Entity>(entity: E, key: EntityKey<E>, value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const attributes = Dynamode.storage.getEntityAttributes(entity.name);
  const separator = Dynamode.separator.get();
  const prefix = attributes[String(key)].prefix || '';
  const suffix = attributes[String(key)].suffix || '';

  return [prefix, value, suffix].filter((p) => p).join(separator);
}

export function truncateValue<E extends typeof Entity>(entity: E, key: EntityKey<E>, value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const attributes = Dynamode.storage.getEntityAttributes(entity.name);
  const separator = Dynamode.separator.get();
  const prefix = attributes[String(key)].prefix || '';
  const suffix = attributes[String(key)].suffix || '';

  return value.replace(`${prefix}${separator}`, '').replace(`${separator}${suffix}`, '');
}
