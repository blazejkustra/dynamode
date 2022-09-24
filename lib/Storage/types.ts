import { Constructor } from 'type-fest';

export type IndexColumnType = StringConstructor | NumberConstructor;
export type TimestampColumnType = StringConstructor | NumberConstructor;
export type ColumnType = StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor | DateConstructor | ArrayConstructor | SetConstructor | MapConstructor;

export type ColumnMetadata<Type> = {
  propertyName?: string;
  indexName?: string;
  prefix?: string;
  suffix?: string;
  type?: Type;
};

export type GsiMetadata = {
  [indexName: string]: {
    partitionKey?: ColumnMetadata<IndexColumnType>;
    sortKey?: ColumnMetadata<IndexColumnType>;
  };
};

export type LsiMetadata = {
  [indexName: string]: {
    sortKey?: ColumnMetadata<IndexColumnType>;
  };
};

export type EntityMetadata = {
  Constructor?: Constructor<unknown>;
  columns?: { [columnName: string]: ColumnMetadata<ColumnType> };
};

export type EntitiesMetadata = {
  [entityName: string]: EntityMetadata;
};

export type TablesMetadata = {
  [tableName: string]: {
    partitionKey?: ColumnMetadata<IndexColumnType>;
    sortKey?: ColumnMetadata<IndexColumnType>;

    globalSecondaryIndexes?: GsiMetadata;
    localSecondaryIndexes?: LsiMetadata;

    createdAt?: ColumnMetadata<TimestampColumnType>;
    updatedAt?: ColumnMetadata<TimestampColumnType>;

    entities?: EntitiesMetadata;
    tableColumns?: { [columnName: string]: ColumnMetadata<ColumnType> };
  };
};
