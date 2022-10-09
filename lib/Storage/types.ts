import { Entity } from '@lib/entity/types';

export type IndexColumnType = StringConstructor | NumberConstructor;
export type TimestampColumnType = StringConstructor | NumberConstructor;
export type ColumnType = StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor | DateConstructor | ArrayConstructor | SetConstructor | MapConstructor;
export type ColumnRole = 'partitionKey' | 'sortKey' | 'gsiPartitionKey' | 'gsiSortKey' | 'lsiSortKey' | 'createdAt' | 'updatedAt' | 'column' | 'dynamodeObject';

export type ColumnMetadata<Type> = {
  propertyName?: string;
  indexName?: string;
  prefix?: string;
  suffix?: string;
  type?: Type;
  role?: ColumnRole;
};

export type GsiMetadata = {
  [indexName: string]: {
    partitionKey?: string;
    sortKey?: string;
  };
};

export type LsiMetadata = {
  [indexName: string]: {
    sortKey?: string;
  };
};

export type EntityMetadata = {
  Constructor?: Entity<any>;
  columns?: { [columnName: string]: ColumnMetadata<ColumnType> };
};

export type EntitiesMetadata = {
  [entityName: string]: EntityMetadata;
};

export type TablesMetadata = {
  [tableName: string]: {
    partitionKey?: string;
    sortKey?: string;

    globalSecondaryIndexes?: GsiMetadata;
    localSecondaryIndexes?: LsiMetadata;

    createdAt?: string;
    updatedAt?: string;

    entities?: EntitiesMetadata;
    tableColumns?: { [columnName: string]: ColumnMetadata<ColumnType> };
  };
};
