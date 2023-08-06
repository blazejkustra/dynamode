/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AttributeRole, ValidateDecoratedAttribute, ValidateMetadataAttribute } from '@lib/dynamode/storage/types';
import Entity from '@lib/entity';
import { Metadata } from '@lib/table/types';
import { DYNAMODE_ALLOWED_KEY_TYPES, ValidationError } from '@lib/utils';

export function validateMetadataAttribute({
  attributes,
  name,
  role,
  indexName,
  entityName,
}: ValidateMetadataAttribute): void {
  const attribute = attributes[name];
  if (!attribute) {
    throw new ValidationError(`Attribute "${name}" should be decorated in "${entityName}" Entity.`);
  }

  if (attribute.role !== role) {
    throw new ValidationError(`Attribute "${name}" is decorated with a wrong role in "${entityName}" Entity.`);
  }

  if (attribute.indexName !== indexName) {
    throw new ValidationError(`Attribute "${name}" is decorated with a wrong index in "${entityName}" Entity.`);
  }

  if (!DYNAMODE_ALLOWED_KEY_TYPES.includes(attribute.type)) {
    throw new ValidationError(`Attribute "${name}" is decorated with invalid type in "${entityName}" Entity.`);
  }
}

export function validateDecoratedAttribute({
  attribute,
  name,
  metadata,
  entityName,
}: ValidateDecoratedAttribute): void {
  const roleValidationMap: Record<AttributeRole, (v: ValidateDecoratedAttribute) => boolean> = {
    partitionKey: ({ name, metadata }) => metadata.partitionKey !== name,
    sortKey: ({ name, metadata }) => metadata.sortKey !== name,
    gsiPartitionKey: ({ attribute, name, metadata }) =>
      !!attribute.indexName && metadata.indexes?.[attribute.indexName]?.partitionKey !== name,
    gsiSortKey: ({ attribute, name, metadata }) =>
      !!attribute.indexName && metadata.indexes?.[attribute.indexName]?.sortKey !== name,
    lsiSortKey: ({ attribute, name, metadata }) =>
      !!attribute.indexName && metadata.indexes?.[attribute.indexName]?.sortKey !== name,
    date: () => false,
    attribute: () => false,
    dynamodeEntity: () => false,
  };

  const validateAttributeRole = roleValidationMap[attribute.role];
  if (validateAttributeRole({ attribute, name, metadata, entityName })) {
    throw new ValidationError(`Attribute "${name}" is decorated with a wrong role in "${entityName}" Entity.`);
  }
}

export function validateMetadataUniqueness(entityName: string, metadata: Metadata<typeof Entity>): void {
  const metadataKeys = [
    metadata.partitionKey,
    metadata.sortKey,
    metadata.createdAt,
    metadata.updatedAt,
    ...Object.values(metadata.indexes ?? {}).flatMap((index) => [index.partitionKey, index.sortKey]),
  ].filter((attribute) => !!attribute);

  if (metadataKeys.length !== new Set(metadataKeys).size) {
    throw new ValidationError(`Duplicated metadata keys passed to "${entityName}" TableManager.`);
  }
}
