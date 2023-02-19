import type { IndexDecoratorOptions, PrefixSuffixOptions } from '@lib/decorators/types';
import Dynamode from '@lib/dynamode/index';
import type { AttributeMetadata, AttributeRole, AttributeType } from '@lib/dynamode/storage/types';

function decorateAttribute(
  type: AttributeType,
  role: AttributeRole,
  options?: PrefixSuffixOptions | IndexDecoratorOptions,
): (Entity: any, propertyName: string) => void {
  return (Entity: any, propertyName: string) => {
    const entityName = Entity.constructor.name;
    const prefix = options && 'prefix' in options ? options.prefix : undefined;
    const suffix = options && 'suffix' in options ? options.suffix : undefined;
    const indexName = options && 'indexName' in options ? options.indexName : undefined;
    const attributeMetadata: AttributeMetadata = {
      propertyName,
      type,
      role,
      indexName,
      prefix,
      suffix,
    };

    Dynamode.storage.registerAttribute(entityName, propertyName, attributeMetadata);
  };
}

function prefix(value: string) {
  return <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => {
    const entityName = Entity.constructor.name;
    Dynamode.storage.updateAttributePrefix(entityName, propertyName, value);
  };
}

function suffix(value: string) {
  return <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => {
    const entityName = Entity.constructor.name;
    Dynamode.storage.updateAttributeSuffix(entityName, propertyName, value);
  };
}

function stringPartitionKey(
  options?: PrefixSuffixOptions,
): <T extends Record<K, string>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(String, 'partitionKey', options);
}

function numberPartitionKey(): <T extends Record<K, number>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(Number, 'partitionKey');
}

function stringSortKey(
  options?: PrefixSuffixOptions,
): <T extends Record<K, string>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(String, 'sortKey', options);
}

function numberSortKey(): <T extends Record<K, number>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(Number, 'sortKey');
}

function stringGsiPartitionKey(
  options: IndexDecoratorOptions & PrefixSuffixOptions,
): <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(String, 'gsiPartitionKey', options);
}

function numberGsiPartitionKey(
  options: IndexDecoratorOptions,
): <T extends Partial<Record<K, number>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(Number, 'gsiPartitionKey', options);
}

function stringGsiSortKey(
  options: IndexDecoratorOptions & PrefixSuffixOptions,
): <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(String, 'gsiSortKey', options);
}

function numberGsiSortKey(
  options: IndexDecoratorOptions,
): <T extends Partial<Record<K, number>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(Number, 'gsiSortKey', options);
}

function stringLsiSortKey(
  options: IndexDecoratorOptions & PrefixSuffixOptions,
): <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(String, 'lsiSortKey', options);
}

function numberLsiSortKey(
  options: IndexDecoratorOptions,
): <T extends Partial<Record<K, number>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(Number, 'lsiSortKey', options);
}

function stringDate(
  options?: PrefixSuffixOptions,
): <T extends Partial<Record<K, Date>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(String, 'date', options);
}

function numberDate(): <T extends Partial<Record<K, Date>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(Number, 'date');
}

function string(
  options?: PrefixSuffixOptions,
): <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(String, 'attribute', options);
}

function number(): <T extends Partial<Record<K, number>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(Number, 'attribute');
}

function boolean(): <T extends Partial<Record<K, boolean>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(Boolean, 'attribute');
}

function object(): <T extends Partial<Record<K, Record<string, unknown>>>, K extends string>(
  Entity: T,
  propertyName: K,
) => void {
  return decorateAttribute(Object, 'attribute');
}

function array(): <T extends Partial<Record<K, Array<unknown>>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(Array, 'attribute');
}

function set(): <T extends Partial<Record<K, Set<string | number>>>, K extends string>(
  Entity: T,
  propertyName: K,
) => void {
  return decorateAttribute(Set, 'attribute');
}

function map(): <T extends Partial<Record<K, Map<unknown, unknown>>>, K extends string>(
  Entity: T,
  propertyName: K,
) => void {
  return decorateAttribute(Map, 'attribute');
}

const attribute = {
  string,
  number,
  boolean,
  object,
  array,
  set,
  map,

  date: {
    string: stringDate,
    number: numberDate,
  },
  partitionKey: {
    string: stringPartitionKey,
    number: numberPartitionKey,
  },
  sortKey: {
    string: stringSortKey,
    number: numberSortKey,
  },
  gsi: {
    partitionKey: {
      string: stringGsiPartitionKey,
      number: numberGsiPartitionKey,
    },
    sortKey: {
      string: stringGsiSortKey,
      number: numberGsiSortKey,
    },
  },
  lsi: {
    sortKey: {
      string: stringLsiSortKey,
      number: numberLsiSortKey,
    },
  },

  prefix,
  suffix,
};

export default attribute;
