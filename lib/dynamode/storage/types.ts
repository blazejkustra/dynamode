import { Entity } from '@lib/entity/types';

export type IndexAttributeType = StringConstructor | NumberConstructor;
export type TimestampAttributeType = StringConstructor | NumberConstructor;
export type AttributeType = StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor | ArrayConstructor | SetConstructor | MapConstructor;
export type AttributeRole = 'partitionKey' | 'sortKey' | 'gsiPartitionKey' | 'gsiSortKey' | 'lsiSortKey' | 'createdAt' | 'updatedAt' | 'attribute' | 'dynamodeEntity';

export type AttributeMetadata<Type> = {
  propertyName?: string;
  indexName?: string;
  prefix?: string;
  suffix?: string;
  type?: Type;
  role?: AttributeRole;
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
  attributes?: { [attributeName: string]: AttributeMetadata<AttributeType> };
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
    tableAttributes?: { [attributeName: string]: AttributeMetadata<AttributeType> };
  };
};
