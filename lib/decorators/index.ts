import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DecoratorOptions } from '@lib/decorators/types';
import { Entity } from '@lib/entity/types';
import { getDynamodeStorage } from '@lib/storage';
import { AttributeMetadata, AttributeType, IndexAttributeType, TimestampAttributeType } from '@lib/storage/types';

// export function dependsOn<T>(value: T) {
//   return (Entity: T, propertyName: string) => {
//     console.log('test', value);
//   };
// }

export function register(value: DynamoDB) {
  return <T extends Entity<T>>(Class: T) => {
    Class.ddb = value;
    return Class;
  };
}

export function prefix(value: string) {
  return <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<AttributeType> = { prefix: value, propertyName };

    getDynamodeStorage().addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function suffix(value: string) {
  return <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<AttributeType> = { suffix: value, propertyName };

    getDynamodeStorage().addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function attribute(type: StringConstructor, options?: DecoratorOptions): <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => void;
export function attribute(type: NumberConstructor): <T extends Partial<Record<K, number>>, K extends string>(Entity: T, propertyName: K) => void;
export function attribute(type: BooleanConstructor): <T extends Partial<Record<K, boolean>>, K extends string>(Entity: T, propertyName: K) => void;
export function attribute(type: ObjectConstructor): <T extends Partial<Record<K, Record<string, unknown>>>, K extends string>(Entity: T, propertyName: K) => void;
export function attribute(type: ArrayConstructor): <T extends Partial<Record<K, Array<unknown>>>, K extends string>(Entity: T, propertyName: K) => void;
export function attribute(type: SetConstructor): <T extends Partial<Record<K, Set<string | number>>>, K extends string>(Entity: T, propertyName: K) => void;
export function attribute(type: MapConstructor): <T extends Partial<Record<K, Map<unknown, unknown>>>, K extends string>(Entity: T, propertyName: K) => void;
export function attribute(type: AttributeType, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const attributeMetadata: AttributeMetadata<AttributeType> = { propertyName, type, role: 'attribute', ...options };

    getDynamodeStorage().addEntityAttributeMetadata(tableName, entityName, propertyName, attributeMetadata);
    getDynamodeStorage().addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function primaryPartitionKey(type: StringConstructor, options?: DecoratorOptions): (Entity: any, propertyName: string) => void;
export function primaryPartitionKey(type: Exclude<IndexAttributeType, StringConstructor>): (Entity: any, propertyName: string) => void;
export function primaryPartitionKey(type: IndexAttributeType, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<IndexAttributeType> = { type, propertyName, role: 'partitionKey', ...options };

    getDynamodeStorage().addPrimaryPartitionKeyMetadata(tableName, propertyName);
    getDynamodeStorage().addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
    getDynamodeStorage().addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function primarySortKey(type: StringConstructor, options?: DecoratorOptions): (Entity: any, propertyName: string) => void;
export function primarySortKey(type: Exclude<IndexAttributeType, StringConstructor>): (Entity: any, propertyName: string) => void;
export function primarySortKey(type: IndexAttributeType, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<IndexAttributeType> = { type, propertyName, role: 'sortKey', ...options };

    getDynamodeStorage().addPrimarySortKeyMetadata(tableName, propertyName);
    getDynamodeStorage().addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
    getDynamodeStorage().addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function gsiPartitionKey(type: StringConstructor, indexName: string, options?: DecoratorOptions): (Entity: any, propertyName: string) => void;
export function gsiPartitionKey(type: Exclude<IndexAttributeType, StringConstructor>, indexName: string): (Entity: any, propertyName: string) => void;
export function gsiPartitionKey(type: IndexAttributeType, indexName: string, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<IndexAttributeType> = { type, propertyName, indexName, role: 'gsiPartitionKey', ...options };

    getDynamodeStorage().addGsiPartitionKeyMetadata(tableName, indexName, propertyName);
    getDynamodeStorage().addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
    getDynamodeStorage().addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function gsiSortKey(type: StringConstructor, indexName: string, options?: DecoratorOptions): (Entity: any, propertyName: string) => void;
export function gsiSortKey(type: Exclude<IndexAttributeType, StringConstructor>, indexName: string): (Entity: any, propertyName: string) => void;
export function gsiSortKey(type: IndexAttributeType, indexName: string, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<IndexAttributeType> = { type, propertyName, indexName, role: 'gsiSortKey', ...options };

    getDynamodeStorage().addGsiSortKeyMetadata(tableName, indexName, propertyName);
    getDynamodeStorage().addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
    getDynamodeStorage().addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function lsiSortKey(type: StringConstructor, indexName: string, options?: DecoratorOptions): (Entity: any, propertyName: string) => void;
export function lsiSortKey(type: Exclude<IndexAttributeType, StringConstructor>, indexName: string): (Entity: any, propertyName: string) => void;
export function lsiSortKey(type: IndexAttributeType, indexName: string, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<IndexAttributeType> = { type, propertyName, indexName, role: 'lsiSortKey', ...options };

    getDynamodeStorage().addLsiSortKeyMetadata(tableName, indexName, propertyName);
    getDynamodeStorage().addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
    getDynamodeStorage().addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function createdAt(type: StringConstructor, options?: DecoratorOptions): (Entity: any, propertyName: string) => void;
export function createdAt(type: Exclude<TimestampAttributeType, StringConstructor>): (Entity: any, propertyName: string) => void;
export function createdAt(type: TimestampAttributeType, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<TimestampAttributeType> = { type, propertyName, role: 'createdAt', ...options };

    getDynamodeStorage().addCreatedAtMetadata(tableName, propertyName);
    getDynamodeStorage().addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
    getDynamodeStorage().addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function updatedAt(type: StringConstructor, options?: DecoratorOptions): (Entity: any, propertyName: string) => void;
export function updatedAt(type: Exclude<TimestampAttributeType, StringConstructor>): (Entity: any, propertyName: string) => void;
export function updatedAt(type: TimestampAttributeType, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: AttributeMetadata<TimestampAttributeType> = { type, propertyName, role: 'createdAt', ...options };

    getDynamodeStorage().addUpdatedAtMetadata(tableName, propertyName);
    getDynamodeStorage().addEntityAttributeMetadata(tableName, entityName, propertyName, metadata);
    getDynamodeStorage().addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}
