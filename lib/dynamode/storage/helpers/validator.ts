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

  if (!indexName && attribute.role === 'index') {
    throw new ValidationError(`Index for attribute "${name}" should be added to "${entityName}" Entity metadata.`);
  }

  if (indexName && attribute.role !== 'index') {
    throw new ValidationError(
      `Attribute "${name}" should be decorated with index "${indexName}" in "${entityName}" Entity.`,
    );
  }

  if (indexName && attribute.role === 'index' && !attribute.indexes.some((index) => index.name === indexName)) {
    throw new ValidationError(
      `Attribute "${name}" is not decorated with index "${indexName}" in "${entityName}" Entity.`,
    );
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
    index: ({ attribute, name, metadata }) => {
      if (!('indexes' in attribute)) {
        return true;
      }

      return attribute.indexes.some((index) => {
        switch (index.role) {
          case 'gsiPartitionKey':
            return metadata.indexes?.[index.name]?.partitionKey !== name;
          case 'gsiSortKey':
          case 'lsiSortKey':
            return metadata.indexes?.[index.name]?.sortKey !== name;
          default:
            return true;
        }
      });
    },
    date: () => false,
    attribute: () => false,
    dynamodeEntity: () => false,
  };

  const validateAttributeRole = roleValidationMap[attribute.role];
  if (validateAttributeRole({ attribute, name, metadata, entityName })) {
    throw new ValidationError(
      `Attribute "${name}" is decorated with a wrong role in "${entityName}" Entity. This could mean two things:\n1. The attribute is not defined in the metadata.\n2. The attribute is defined in the metadata but in the class a a wrong decorator was used.`,
    );
  }
}

export function validateMetadataUniqueness(entityName: string, metadata: Metadata<typeof Entity>): void {
  const allIndexes = Object.values(metadata.indexes ?? {}).flatMap((index) => [index.partitionKey, index.sortKey]);

  const metadataKeys = [
    metadata.partitionKey,
    metadata.sortKey,
    metadata.createdAt,
    metadata.updatedAt,
    ...new Set(allIndexes),
  ].filter((attribute) => !!attribute);

  if (metadataKeys.length !== new Set(metadataKeys).size) {
    throw new ValidationError(`Duplicated metadata keys passed to "${entityName}" TableManager.`);
  }
}
