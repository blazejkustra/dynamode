import type { DecoratorOptions } from '@lib/decorators/types';
import { Dynamode } from '@lib/dynamode';
import type {
  AttributeMetadata,
  AttributeType,
  IndexAttributeType,
  TimestampAttributeType,
} from '@lib/dynamode/storage/types';
import { Entity } from '@lib/entity';

// export function dependsOn<T>(value: T) {
//   return (Entity: T, propertyName: string) => {
//     console.log('test', value);
//   };
// }

// TODO: implement
export function registerTable(tableName: string) {
  return <E extends typeof Entity>(Class: E) => {
    Class.tableName = tableName;
    return Class;
  };
}

export function prefix(value: string) {
  return <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => {
    const tableName = (<any>Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<AttributeType> = {
      prefix: value,
      propertyName,
    };

    Dynamode.storage.addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function suffix(value: string) {
  return <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => {
    const tableName = (<any>Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<AttributeType> = {
      suffix: value,
      propertyName,
    };

    Dynamode.storage.addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function attribute(
  type: StringConstructor,
  options?: DecoratorOptions,
): <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => void;

export function attribute(
  type: NumberConstructor,
): <T extends Partial<Record<K, number>>, K extends string>(Entity: T, propertyName: K) => void;

export function attribute(
  type: BooleanConstructor,
): <T extends Partial<Record<K, boolean>>, K extends string>(Entity: T, propertyName: K) => void;

export function attribute(
  type: ObjectConstructor,
): <T extends Partial<Record<K, Record<string, unknown>>>, K extends string>(Entity: T, propertyName: K) => void;

export function attribute(
  type: ArrayConstructor,
): <T extends Partial<Record<K, Array<unknown>>>, K extends string>(Entity: T, propertyName: K) => void;

export function attribute(
  type: SetConstructor,
): <T extends Partial<Record<K, Set<string | number>>>, K extends string>(Entity: T, propertyName: K) => void;

export function attribute(
  type: MapConstructor,
): <T extends Partial<Record<K, Map<unknown, unknown>>>, K extends string>(Entity: T, propertyName: K) => void;

export function attribute(type: AttributeType, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Entity.constructor.tableName;
    const entityName = Entity.constructor.name;
    const attributeMetadata: AttributeMetadata<AttributeType> = {
      propertyName,
      type,
      role: 'attribute',
      ...options,
    };

    Dynamode.storage.addEntityAttributeMetadata(tableName, entityName, propertyName, attributeMetadata);
    Dynamode.storage.addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function primaryPartitionKey(
  type: StringConstructor,
  options?: DecoratorOptions,
): <T extends Record<K, string>, K extends string>(Entity: T, propertyName: K) => void;

export function primaryPartitionKey(
  type: NumberConstructor,
): <T extends Record<K, number>, K extends string>(Entity: T, propertyName: K) => void;

export function primaryPartitionKey(type: IndexAttributeType, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Entity.constructor.tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<IndexAttributeType> = {
      type,
      propertyName,
      role: 'partitionKey',
      ...options,
    };

    Dynamode.storage.addPrimaryPartitionKeyMetadata(tableName, propertyName);
    Dynamode.storage.addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
    Dynamode.storage.addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function primarySortKey(
  type: StringConstructor,
  options?: DecoratorOptions,
): <T extends Record<K, string>, K extends string>(Entity: T, propertyName: K) => void;

export function primarySortKey(
  type: NumberConstructor,
): <T extends Record<K, number>, K extends string>(Entity: T, propertyName: K) => void;

export function primarySortKey(type: IndexAttributeType, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Entity.constructor.tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<IndexAttributeType> = {
      type,
      propertyName,
      role: 'sortKey',
      ...options,
    };

    Dynamode.storage.addPrimarySortKeyMetadata(tableName, propertyName);
    Dynamode.storage.addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
    Dynamode.storage.addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function gsiPartitionKey(
  type: StringConstructor,
  indexName: string,
  options?: DecoratorOptions,
): <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => void;

export function gsiPartitionKey(
  type: NumberConstructor,
  indexName: string,
): <T extends Partial<Record<K, number>>, K extends string>(Entity: T, propertyName: K) => void;

export function gsiPartitionKey(type: IndexAttributeType, indexName: string, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Entity.constructor.tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<IndexAttributeType> = {
      type,
      propertyName,
      indexName,
      role: 'gsiPartitionKey',
      ...options,
    };

    Dynamode.storage.addGsiPartitionKeyMetadata(tableName, indexName, propertyName);
    Dynamode.storage.addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
    Dynamode.storage.addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function gsiSortKey(
  type: StringConstructor,
  indexName: string,
  options?: DecoratorOptions,
): <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => void;

export function gsiSortKey(
  type: NumberConstructor,
  indexName: string,
): <T extends Partial<Record<K, number>>, K extends string>(Entity: T, propertyName: K) => void;

export function gsiSortKey(type: IndexAttributeType, indexName: string, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Entity.constructor.tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<IndexAttributeType> = {
      type,
      propertyName,
      indexName,
      role: 'gsiSortKey',
      ...options,
    };

    Dynamode.storage.addGsiSortKeyMetadata(tableName, indexName, propertyName);
    Dynamode.storage.addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
    Dynamode.storage.addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function lsiSortKey(
  type: StringConstructor,
  indexName: string,
  options?: DecoratorOptions,
): <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => void;

export function lsiSortKey(
  type: NumberConstructor,
  indexName: string,
): <T extends Partial<Record<K, number>>, K extends string>(Entity: T, propertyName: K) => void;

export function lsiSortKey(type: IndexAttributeType, indexName: string, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Entity.constructor.tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<IndexAttributeType> = {
      type,
      propertyName,
      indexName,
      role: 'lsiSortKey',
      ...options,
    };

    Dynamode.storage.addLsiSortKeyMetadata(tableName, indexName, propertyName);
    Dynamode.storage.addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
    Dynamode.storage.addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function createdAt(
  type: StringConstructor,
  options?: DecoratorOptions,
): <T extends Partial<Record<K, Date>>, K extends string>(Entity: T, propertyName: K) => void;

export function createdAt(
  type: NumberConstructor,
): <T extends Partial<Record<K, Date>>, K extends string>(Entity: T, propertyName: K) => void;

export function createdAt(type: TimestampAttributeType, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Entity.constructor.tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<TimestampAttributeType> = {
      type,
      propertyName,
      role: 'createdAt',
      ...options,
    };

    Dynamode.storage.addCreatedAtMetadata(tableName, propertyName);
    Dynamode.storage.addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
    Dynamode.storage.addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function updatedAt(
  type: StringConstructor,
  options?: DecoratorOptions,
): <T extends Partial<Record<K, Date>>, K extends string>(Entity: T, propertyName: K) => void;

export function updatedAt(
  type: NumberConstructor,
): <T extends Partial<Record<K, Date>>, K extends string>(Entity: T, propertyName: K) => void;

export function updatedAt(type: TimestampAttributeType, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Entity.constructor.tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<TimestampAttributeType> = {
      type,
      propertyName,
      role: 'createdAt',
      ...options,
    };

    Dynamode.storage.addUpdatedAtMetadata(tableName, propertyName);
    Dynamode.storage.addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
    Dynamode.storage.addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}
