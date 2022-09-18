import { Class } from 'type-fest';

import { ColumnDecoratorOptions, PrimarySortKeyDecoratorOptions } from '@lib/decorators/types';
import { getDynamodeStorage } from '@lib/Storage';
import { ColumnType, IndexColumnType, TimestampColumnType } from '@lib/Storage/types';

import { CreatedAtDecoratorOptions, GsiPartitionKeyDecoratorOptions, GsiSortKeyDecoratorOptions, lsiSortKeyDecoratorOptions, PrimaryPartitionKeyDecoratorOptions, UpdatedAtDecoratorOptions } from './types';

export function entity() {
  return <T extends Class<unknown> & { tableName: string }>(Entity: T) => {
    const entityName = Entity.name;
    const tableName = Entity.tableName;
    const metadata = { tableName, Entity };

    getDynamodeStorage().addEntityMetadata(entityName, metadata);
    return Entity;
  };
}

export function column(type: ColumnType, options?: ColumnDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const entityName = Entity.constructor.name;
    const metadata = { propertyName, type, ...options };

    getDynamodeStorage().addEntityColumnMetadata(entityName, propertyName, metadata);
  };
}

export function prefix(value: string) {
  return (Entity: any, propertyName: string) => {
    const entityName = Entity.constructor.name;
    const metadata = { prefix: value, propertyName };

    getDynamodeStorage().addEntityColumnMetadata(entityName, propertyName, metadata);
  };
}

export function suffix(value: string) {
  return (Entity: any, propertyName: string) => {
    const entityName = Entity.constructor.name;
    const metadata = { suffix: value, propertyName };

    getDynamodeStorage().addEntityColumnMetadata(entityName, propertyName, metadata);
  };
}

export function primaryPartitionKey(type: IndexColumnType, options?: PrimaryPartitionKeyDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata = { type, propertyName, ...options };

    getDynamodeStorage().addPrimaryPartitionKeyMetadata(tableName, metadata);
    getDynamodeStorage().addEntityColumnMetadata(entityName, propertyName, metadata);
  };
}

export function primarySortKey(type: IndexColumnType, options?: PrimarySortKeyDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata = { type, propertyName, ...options };

    getDynamodeStorage().addPrimarySortKeyMetadata(tableName, metadata);
    getDynamodeStorage().addEntityColumnMetadata(entityName, propertyName, metadata);
  };
}

export function gsiPartitionKey(type: IndexColumnType, indexName: string, options?: GsiPartitionKeyDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata = { type, propertyName, ...options };

    getDynamodeStorage().addGsiPartitionKeyMetadata(tableName, indexName, metadata);
    getDynamodeStorage().addEntityColumnMetadata(entityName, propertyName, metadata);
  };
}

export function gsiSortKey(type: IndexColumnType, indexName: string, options?: GsiSortKeyDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata = { type, propertyName, ...options };

    getDynamodeStorage().addGsiSortKeyMetadata(tableName, indexName, metadata);
    getDynamodeStorage().addEntityColumnMetadata(entityName, propertyName, metadata);
  };
}

export function lsiSortKey(type: IndexColumnType, indexName: string, options?: lsiSortKeyDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata = { type, propertyName, ...options };

    getDynamodeStorage().addLsiSortKeyMetadata(tableName, indexName, metadata);
    getDynamodeStorage().addEntityColumnMetadata(entityName, propertyName, metadata);
  };
}

export function createdAt(type: TimestampColumnType, options?: CreatedAtDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata = { type, propertyName, ...options };

    getDynamodeStorage().addCreatedAtMetadata(tableName, metadata);
    getDynamodeStorage().addEntityColumnMetadata(entityName, propertyName, metadata);
  };
}

export function updatedAt(type: TimestampColumnType, options?: UpdatedAtDecoratorOptions) {
  return (Entity: any, propertyName: string) => {
    const tableName = Object.getPrototypeOf(Entity.constructor).tableName;
    const entityName = Entity.constructor.name;
    const metadata = { type, propertyName, ...options };

    getDynamodeStorage().addUpdatedAtMetadata(tableName, metadata);
    getDynamodeStorage().addEntityColumnMetadata(entityName, propertyName, metadata);
  };
}
