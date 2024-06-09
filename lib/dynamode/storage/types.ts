import Entity from '@lib/entity';
import { Metadata } from '@lib/table/types';

export type IndexAttributeType = StringConstructor | NumberConstructor;
export type TimestampAttributeType = StringConstructor | NumberConstructor;

export type AttributeType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ObjectConstructor
  | ArrayConstructor
  | SetConstructor
  | MapConstructor
  | Uint8ArrayConstructor;

export type AttributeRole = 'partitionKey' | 'sortKey' | 'index' | 'date' | 'attribute' | 'dynamodeEntity';
export type AttributeIndexRole = 'gsiPartitionKey' | 'gsiSortKey' | 'lsiSortKey';

type BaseAttributeMetadata = {
  propertyName: string;
  type: AttributeType;
  prefix?: string;
  suffix?: string;
};

export type NonIndexAttributeMetadata = BaseAttributeMetadata & {
  role: Exclude<AttributeRole, 'index'>;
  indexName?: never;
};

export type IndexMetadata = { name: string; role: AttributeIndexRole };

export type IndexAttributeMetadata = BaseAttributeMetadata & {
  role: 'index';
  indexes: IndexMetadata[];
};

export type AttributeMetadata = NonIndexAttributeMetadata | IndexAttributeMetadata;

export type AttributesMetadata = {
  [attributeName: string]: AttributeMetadata;
};

export type EntityMetadata = {
  tableName: string;
  entity: typeof Entity;
  attributes: AttributesMetadata;
};

export type EntitiesMetadata = {
  [entityName: string]: EntityMetadata;
};

export type TableMetadata = {
  tableEntity: typeof Entity;
  metadata: Metadata<typeof Entity>;
};

export type TablesMetadata = {
  [tableName: string]: TableMetadata;
};

// helpers

export type ValidateMetadataAttribute = {
  entityName: string;
  name: string;
  attributes: AttributesMetadata;
  role: AttributeRole;
  indexName?: string;
};

export type ValidateDecoratedAttribute = {
  entityName: string;
  name: string;
  attribute: AttributeMetadata;
  metadata: Metadata<typeof Entity>;
};
