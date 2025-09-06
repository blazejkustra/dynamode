import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import { InvalidParameter, LiteralKey } from '@lib/utils';

export function prefixSuffixValue<E extends typeof Entity>(entity: E, key: LiteralKey, value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const attributes = Dynamode.storage.getEntityAttributes(entity.name);
  const separator = Dynamode.separator.get();
  const prefix = attributes[key as string]?.prefix || '';
  const suffix = attributes[key as string]?.suffix || '';

  return [prefix, value, suffix].filter((p) => p).join(separator);
}

export function truncateValue<E extends typeof Entity>(entity: E, key: LiteralKey, value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const attributes = Dynamode.storage.getEntityAttributes(entity.name);
  const separator = Dynamode.separator.get();
  const prefix = attributes[key as string].prefix || '';
  const suffix = attributes[key as string].suffix || '';

  const valueSections = value.split(separator);

  if (valueSections.at(0) === prefix) {
    valueSections.shift();
  }

  if (valueSections.at(-1) === suffix) {
    valueSections.pop();
  }

  return valueSections.join(separator);
}

export function transformDateValue<E extends typeof Entity>(entity: E, key: LiteralKey, value: unknown): unknown {
  const attributes = Dynamode.storage.getEntityAttributes(entity.name);
  const attribute = attributes[key as string];

  if (value instanceof Date) {
    if (attribute.role !== 'date') {
      throw new InvalidParameter('Invalid date attribute role');
    }

    switch (attribute.type) {
      case String: {
        return value.toISOString();
      }
      case Number: {
        return value.getTime();
      }
      default: {
        throw new InvalidParameter('Invalid date attribute type');
      }
    }
  }

  return value;
}

export function transformValue<E extends typeof Entity>(entity: E, key: LiteralKey, value: unknown): unknown {
  const processedValue = transformDateValue(entity, key, value);
  return prefixSuffixValue(entity, key, processedValue);
}
