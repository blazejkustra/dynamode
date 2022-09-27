import { ColumnDecoratorOptions, PrimarySortKeyDecoratorOptions } from '@lib/decorators/types';
import { getDynamodeStorage } from '@lib/Storage';
import { ColumnMetadata, ColumnType, IndexColumnType, TimestampColumnType } from '@lib/Storage/types';

import { CreatedAtDecoratorOptions, GsiPartitionKeyDecoratorOptions, GsiSortKeyDecoratorOptions, lsiSortKeyDecoratorOptions, PrimaryPartitionKeyDecoratorOptions, UpdatedAtDecoratorOptions } from './types';

// export function dependsOn<T>(value: T) {
//   return (Entity: T, propertyName: string) => {
//     console.log('test', value);
//   };
// }

export function column(type: ColumnType, options?: ColumnDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const columnMetadata: ColumnMetadata<ColumnType> = { propertyName, type, role: 'column', ...options };

    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, columnMetadata);
    getDynamodeStorage().addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function prefix(value: string) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: ColumnMetadata<ColumnType> = { prefix: value, propertyName };

    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function suffix(value: string) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: ColumnMetadata<ColumnType> = { suffix: value, propertyName };

    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function primaryPartitionKey(type: IndexColumnType, options?: PrimaryPartitionKeyDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: ColumnMetadata<IndexColumnType> = { type, propertyName, role: 'partitionKey', ...options };

    getDynamodeStorage().addPrimaryPartitionKeyMetadata(tableName, propertyName);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function primarySortKey(type: IndexColumnType, options?: PrimarySortKeyDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: ColumnMetadata<IndexColumnType> = { type, propertyName, role: 'sortKey', ...options };

    getDynamodeStorage().addPrimarySortKeyMetadata(tableName, propertyName);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function gsiPartitionKey(type: IndexColumnType, indexName: string, options?: GsiPartitionKeyDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: ColumnMetadata<IndexColumnType> = { type, propertyName, indexName, role: 'gsiPartitionKey', ...options };

    getDynamodeStorage().addGsiPartitionKeyMetadata(tableName, indexName, propertyName);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function gsiSortKey(type: IndexColumnType, indexName: string, options?: GsiSortKeyDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: ColumnMetadata<IndexColumnType> = { type, propertyName, indexName, role: 'gsiSortKey', ...options };

    getDynamodeStorage().addGsiSortKeyMetadata(tableName, indexName, propertyName);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function lsiSortKey(type: IndexColumnType, indexName: string, options?: lsiSortKeyDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: ColumnMetadata<IndexColumnType> = { type, propertyName, indexName, role: 'lsiSortKey', ...options };

    getDynamodeStorage().addLsiSortKeyMetadata(tableName, indexName, propertyName);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function createdAt(type: TimestampColumnType, options?: CreatedAtDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: ColumnMetadata<TimestampColumnType> = { type, propertyName, role: 'createdAt', ...options };

    getDynamodeStorage().addCreatedAtMetadata(tableName, propertyName);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function updatedAt(type: TimestampColumnType, options?: UpdatedAtDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata: ColumnMetadata<TimestampColumnType> = { type, propertyName, role: 'createdAt', ...options };

    getDynamodeStorage().addUpdatedAtMetadata(tableName, propertyName);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}
