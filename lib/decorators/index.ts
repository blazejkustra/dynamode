import { ColumnDecoratorOptions, PrimarySortKeyDecoratorOptions } from '@lib/decorators/types';
import { getDynamodeStorage } from '@lib/Storage';
import { ColumnType, IndexColumnType, TimestampColumnType } from '@lib/Storage/types';

import { CreatedAtDecoratorOptions, GsiPartitionKeyDecoratorOptions, GsiSortKeyDecoratorOptions, lsiSortKeyDecoratorOptions, PrimaryPartitionKeyDecoratorOptions, UpdatedAtDecoratorOptions } from './types';

export function column(type: ColumnType, options?: ColumnDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const columnMetadata = { propertyName, type, ...options };

    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, columnMetadata);
    getDynamodeStorage().addEntityConstructor(tableName, entityName, Entity.constructor);
  };
}

export function prefix(value: string) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata = { prefix: value, propertyName };

    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function suffix(value: string) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata = { suffix: value, propertyName };

    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function primaryPartitionKey(type: IndexColumnType, options?: PrimaryPartitionKeyDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata = { type, propertyName, ...options };

    getDynamodeStorage().addPrimaryPartitionKeyMetadata(tableName, metadata);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function primarySortKey(type: IndexColumnType, options?: PrimarySortKeyDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata = { type, propertyName, ...options };

    getDynamodeStorage().addPrimarySortKeyMetadata(tableName, metadata);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function gsiPartitionKey(type: IndexColumnType, indexName: string, options?: GsiPartitionKeyDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata = { type, propertyName, indexName, ...options };

    getDynamodeStorage().addGsiPartitionKeyMetadata(tableName, indexName, metadata);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function gsiSortKey(type: IndexColumnType, indexName: string, options?: GsiSortKeyDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata = { type, propertyName, indexName, ...options };

    getDynamodeStorage().addGsiSortKeyMetadata(tableName, indexName, metadata);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function lsiSortKey(type: IndexColumnType, indexName: string, options?: lsiSortKeyDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata = { type, propertyName, indexName, ...options };

    getDynamodeStorage().addLsiSortKeyMetadata(tableName, indexName, metadata);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function createdAt(type: TimestampColumnType, options?: CreatedAtDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata = { type, propertyName, ...options };

    getDynamodeStorage().addCreatedAtMetadata(tableName, metadata);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}

export function updatedAt(type: TimestampColumnType, options?: UpdatedAtDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata = { type, propertyName, ...options };

    getDynamodeStorage().addUpdatedAtMetadata(tableName, metadata);
    getDynamodeStorage().addEntityColumnMetadata(tableName, entityName, propertyName, metadata);
  };
}
