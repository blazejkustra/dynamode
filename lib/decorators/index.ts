import { DecoratorOptions } from '@lib/decorators/types';
import { getDynamodeStorage } from '@lib/storage';
import { ColumnMetadata, ColumnType, IndexColumnType, TimestampColumnType } from '@lib/storage/types';

// export function dependsOn<T>(value: T) {
//   return (Entity: T, propertyName: string) => {
//     console.log('test', value);
//   };
// }

export function prefix(value: string) {
  return <T extends Record<K, string>, K extends string>(Entity: T, propertyName: K) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: ColumnMetadata<ColumnType> = { prefix: value, propertyName };

    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function suffix(value: string) {
  return <T extends Record<K, string>, K extends string>(Entity: T, propertyName: K) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: ColumnMetadata<ColumnType> = { suffix: value, propertyName };

    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function column(type: StringConstructor, options?: DecoratorOptions): (Entity: any, propertyName: string) => void;
export function column(type: Exclude<ColumnType, StringConstructor>): (Entity: any, propertyName: string) => void;
export function column(type: ColumnType, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const columnMetadata: ColumnMetadata<ColumnType> = { propertyName, type, role: 'column', ...options };

    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, columnMetadata);
    getDynamodeStorage().addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function primaryPartitionKey(type: StringConstructor, options?: DecoratorOptions): (Entity: any, propertyName: string) => void;
export function primaryPartitionKey(type: Exclude<IndexColumnType, StringConstructor>): (Entity: any, propertyName: string) => void;
export function primaryPartitionKey(type: IndexColumnType, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: ColumnMetadata<IndexColumnType> = { type, propertyName, role: 'partitionKey', ...options };

    getDynamodeStorage().addPrimaryPartitionKeyMetadata(tableName, propertyName);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
    getDynamodeStorage().addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function primarySortKey(type: StringConstructor, options?: DecoratorOptions): (Entity: any, propertyName: string) => void;
export function primarySortKey(type: Exclude<IndexColumnType, StringConstructor>): (Entity: any, propertyName: string) => void;
export function primarySortKey(type: IndexColumnType, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: ColumnMetadata<IndexColumnType> = { type, propertyName, role: 'sortKey', ...options };

    getDynamodeStorage().addPrimarySortKeyMetadata(tableName, propertyName);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
    getDynamodeStorage().addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function gsiPartitionKey(type: StringConstructor, indexName: string, options?: DecoratorOptions): (Entity: any, propertyName: string) => void;
export function gsiPartitionKey(type: Exclude<IndexColumnType, StringConstructor>, indexName: string): (Entity: any, propertyName: string) => void;
export function gsiPartitionKey(type: IndexColumnType, indexName: string, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: ColumnMetadata<IndexColumnType> = { type, propertyName, indexName, role: 'gsiPartitionKey', ...options };

    getDynamodeStorage().addGsiPartitionKeyMetadata(tableName, indexName, propertyName);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
    getDynamodeStorage().addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function gsiSortKey(type: StringConstructor, indexName: string, options?: DecoratorOptions): (Entity: any, propertyName: string) => void;
export function gsiSortKey(type: Exclude<IndexColumnType, StringConstructor>, indexName: string): (Entity: any, propertyName: string) => void;
export function gsiSortKey(type: IndexColumnType, indexName: string, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: ColumnMetadata<IndexColumnType> = { type, propertyName, indexName, role: 'gsiSortKey', ...options };

    getDynamodeStorage().addGsiSortKeyMetadata(tableName, indexName, propertyName);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
    getDynamodeStorage().addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function lsiSortKey(type: StringConstructor, indexName: string, options?: DecoratorOptions): (Entity: any, propertyName: string) => void;
export function lsiSortKey(type: Exclude<IndexColumnType, StringConstructor>, indexName: string): (Entity: any, propertyName: string) => void;
export function lsiSortKey(type: IndexColumnType, indexName: string, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: ColumnMetadata<IndexColumnType> = { type, propertyName, indexName, role: 'lsiSortKey', ...options };

    getDynamodeStorage().addLsiSortKeyMetadata(tableName, indexName, propertyName);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
    getDynamodeStorage().addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function createdAt(type: StringConstructor, options?: DecoratorOptions): (Entity: any, propertyName: string) => void;
export function createdAt(type: Exclude<TimestampColumnType, StringConstructor>): (Entity: any, propertyName: string) => void;
export function createdAt(type: TimestampColumnType, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: ColumnMetadata<TimestampColumnType> = { type, propertyName, role: 'createdAt', ...options };

    getDynamodeStorage().addCreatedAtMetadata(tableName, propertyName);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
    getDynamodeStorage().addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function updatedAt(type: StringConstructor, options?: DecoratorOptions): (Entity: any, propertyName: string) => void;
export function updatedAt(type: Exclude<TimestampColumnType, StringConstructor>): (Entity: any, propertyName: string) => void;
export function updatedAt(type: TimestampColumnType, options?: DecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: ColumnMetadata<TimestampColumnType> = { type, propertyName, role: 'createdAt', ...options };

    getDynamodeStorage().addUpdatedAtMetadata(tableName, propertyName);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
    getDynamodeStorage().addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}
