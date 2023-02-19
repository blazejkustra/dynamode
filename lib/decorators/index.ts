import type { DateDecoratorOptions, IndexDecoratorOptions, PrefixSuffixOptions } from '@lib/decorators/types';
import Dynamode from '@lib/dynamode/index';
import type { AttributeMetadata, AttributeRole, AttributeType } from '@lib/dynamode/storage/types';
import { Entity } from '@lib/entity';

import { DefaultError } from './../utils/errors';

function decorateAttribute(
  type: AttributeType,
  role: AttributeRole,
  options?: PrefixSuffixOptions | IndexDecoratorOptions,
): (Entity: any, propertyName: string) => void {
  return (Entity: any, propertyName: string) => {
    const tableName = Entity.constructor.tableName;
    const entityName = Entity.constructor.name;

    const prefix = options && 'prefix' in options ? options.prefix : undefined;
    const suffix = options && 'suffix' in options ? options.suffix : undefined;
    const indexName = options && 'indexName' in options ? options.indexName : undefined;

    const attributeMetadata: AttributeMetadata<AttributeType> = {
      propertyName,
      type,
      role,
      indexName,
      prefix,
      suffix,
    };

    switch (role) {
      case 'partitionKey': {
        Dynamode.storage.addPrimaryPartitionKeyMetadata(tableName, propertyName);
        break;
      }

      case 'sortKey': {
        Dynamode.storage.addPrimarySortKeyMetadata(tableName, propertyName);
        break;
      }

      case 'lsiSortKey': {
        if (!indexName) {
          throw new DefaultError();
        }

        Dynamode.storage.addLsiSortKeyMetadata(tableName, indexName, propertyName);
        break;
      }

      case 'gsiPartitionKey': {
        if (!indexName) {
          throw new DefaultError();
        }

        Dynamode.storage.addGsiPartitionKeyMetadata(tableName, indexName, propertyName);
        break;
      }

      case 'gsiSortKey': {
        if (!indexName) {
          throw new DefaultError();
        }

        Dynamode.storage.addGsiSortKeyMetadata(tableName, indexName, propertyName);
        break;
      }

      case 'createdAt': {
        Dynamode.storage.addCreatedAtMetadata(tableName, propertyName);
        break;
      }

      case 'updatedAt': {
        Dynamode.storage.addUpdatedAtMetadata(tableName, propertyName);
        break;
      }

      case 'attribute': {
        break;
      }

      default: {
        throw new DefaultError();
      }
    }

    Dynamode.storage.addEntityAttributeMetadata(tableName, entityName, propertyName, attributeMetadata);
    Dynamode.storage.addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

function prefix(value: string) {
  return <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => {
    const tableName = (<any>Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<AttributeType> = {
      propertyName,
      prefix: value,
    };

    Dynamode.storage.addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
  };
}

function suffix(value: string) {
  return <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => {
    const tableName = (<any>Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<AttributeType> = {
      propertyName,
      suffix: value,
    };

    Dynamode.storage.addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
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
  options: DateDecoratorOptions & PrefixSuffixOptions,
): <T extends Partial<Record<K, Date>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(String, options?.as || 'date', options);
}

function numberDate(
  options: DateDecoratorOptions,
): <T extends Partial<Record<K, Date>>, K extends string>(Entity: T, propertyName: K) => void {
  return decorateAttribute(Number, options?.as || 'date');
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

export const attribute = {
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

// TODO: implement
export function registerTable(tableName: string) {
  return <E extends typeof Entity>(Class: E) => {
    Class.tableName = tableName;
    return Class;
  };
}
