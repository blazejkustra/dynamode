import Entity from '@lib/entity';
import { Metadata } from '@lib/table/types';

/**
 * Storage and metadata types for Dynamode.
 */

/**
 * Attribute types that can be used for indexes.
 */
export type IndexAttributeType = StringConstructor | NumberConstructor;

/**
 * Attribute types that can be used for timestamps.
 */
export type TimestampAttributeType = StringConstructor | NumberConstructor;

/**
 * All supported attribute types in Dynamode.
 */
export type AttributeType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ObjectConstructor
  | ArrayConstructor
  | SetConstructor
  | MapConstructor
  | Uint8ArrayConstructor;

/**
 * Roles that attributes can have in Dynamode.
 */
export type AttributeRole = 'partitionKey' | 'sortKey' | 'index' | 'date' | 'attribute' | 'dynamodeEntity';

/**
 * Roles that attributes can have in secondary indexes.
 */
export type AttributeIndexRole = 'gsiPartitionKey' | 'gsiSortKey' | 'lsiSortKey';

/**
 * Base attribute metadata structure.
 */
type BaseAttributeMetadata = {
  /** Name of the property */
  propertyName: string;
  /** Type of the attribute */
  type: AttributeType;
  /** Optional prefix for the attribute value */
  prefix?: string;
  /** Optional suffix for the attribute value */
  suffix?: string;
};

/**
 * Metadata for secondary index attributes.
 */
export type IndexMetadata = {
  /** Name of the index */
  name: string;
  /** Role of the attribute in the index */
  role: AttributeIndexRole;
};

/**
 * Complete attribute metadata including role and indexes.
 */
export type AttributeMetadata = BaseAttributeMetadata & {
  /** Role of the attribute */
  role: AttributeRole;
  /** Associated indexes */
  indexes?: IndexMetadata[];
};

/**
 * Metadata for attributes that are part of indexes.
 */
export type AttributeIndexMetadata = BaseAttributeMetadata & {
  /** Role is always 'index' for this type */
  role: 'index';
  /** Required indexes for this attribute */
  indexes: IndexMetadata[];
};

/**
 * Collection of attribute metadata for an entity.
 */
export type AttributesMetadata = {
  [attributeName: string]: AttributeMetadata;
};

/**
 * Complete entity metadata including table and attributes.
 */
export type EntityMetadata = {
  /** Name of the table */
  tableName: string;
  /** Entity class */
  entity: typeof Entity;
  /** Attributes metadata */
  attributes: AttributesMetadata;
};

/**
 * Collection of entity metadata.
 */
export type EntitiesMetadata = {
  [entityName: string]: EntityMetadata;
};

/**
 * Table metadata including entity and configuration.
 */
export type TableMetadata = {
  /** Table entity class */
  tableEntity: typeof Entity;
  /** Table configuration metadata */
  metadata: Metadata<typeof Entity>;
};

/**
 * Collection of table metadata.
 */
export type TablesMetadata = {
  [tableName: string]: TableMetadata;
};

/**
 * Helper types for validation operations.
 */

/**
 * Type for validating metadata attributes.
 */
export type ValidateMetadataAttribute = {
  /** Name of the entity */
  entityName: string;
  /** Name of the attribute */
  name: string;
  /** Attributes metadata */
  attributes: AttributesMetadata;
  /** Valid roles for the attribute */
  validRoles: AttributeRole[];
  /** Optional index name */
  indexName?: string;
};

/**
 * Type for validating decorated attributes.
 */
export type ValidateDecoratedAttribute = {
  /** Name of the entity */
  entityName: string;
  /** Name of the attribute */
  name: string;
  /** Attribute metadata */
  attribute: AttributeMetadata;
  /** Table metadata */
  metadata: Metadata<typeof Entity>;
};
