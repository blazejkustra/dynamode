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
  | MapConstructor;

export type AttributeRole =
  | 'partitionKey'
  | 'sortKey'
  | 'gsiPartitionKey'
  | 'gsiSortKey'
  | 'lsiSortKey'
  | 'date'
  | 'attribute'
  | 'dynamodeEntity';

export type AttributeMetadata = {
  propertyName: string;
  type: AttributeType;
  role: AttributeRole;
  indexName?: string;
  prefix?: string;
  suffix?: string;
};

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

export type ValidateAttribute = {
  attributes: AttributesMetadata;
  role: AttributeRole;
  name?: string;
  indexName?: string;
};
