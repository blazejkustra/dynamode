import type { ValidateDecoratedAttribute, ValidateMetadataAttribute } from '@lib/dynamode/storage/types';
import { DYNAMODE_ALLOWED_KEY_TYPES, ValidationError } from '@lib/utils';

export function validateMetadataAttribute({
  attributes,
  name,
  validRoles,
  indexName,
  entityName,
}: ValidateMetadataAttribute): void {
  const attribute = attributes[name];
  if (!attribute) {
    throw new ValidationError(`Attribute "${name}" should be decorated in "${entityName}" Entity.`);
  }

  if (!validRoles.includes(attribute.role)) {
    throw new ValidationError(`Attribute "${name}" is decorated with a wrong role in "${entityName}" Entity.`);
  }

  if (indexName && !attribute.indexes) {
    throw new ValidationError(
      `Attribute "${name}" should be decorated with index "${indexName}" in "${entityName}" Entity.`,
    );
  }

  if (indexName && !attribute.indexes?.some((index) => index.name === indexName)) {
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
  if (attribute.role === 'partitionKey' && metadata.partitionKey !== name) {
    throw new ValidationError(
      `Attribute "${name}" is not defined as a partition key in "${entityName}" Entity's metadata.`,
    );
  }

  if (attribute.role === 'sortKey' && metadata.sortKey !== name) {
    throw new ValidationError(`Attribute "${name}" is not defined as a sort key in "${entityName}" Entity's metadata.`);
  }

  if (!attribute.indexes) {
    return;
  }

  attribute.indexes.forEach((index) => {
    if (index.role === 'gsiPartitionKey' && metadata.indexes?.[index.name]?.partitionKey !== name) {
      throw new ValidationError(
        `Attribute "${name}" is not defined as a GSI partition key in "${entityName}" Entity's metadata for index named "${index.name}".`,
      );
    }

    if (index.role === 'gsiSortKey' && metadata.indexes?.[index.name]?.sortKey !== name) {
      throw new ValidationError(
        `Attribute "${name}" is not defined as a GSI sort key in "${entityName}" Entity's metadata for index named "${index.name}".`,
      );
    }

    if (index.role === 'lsiSortKey' && metadata.indexes?.[index.name]?.sortKey !== name) {
      throw new ValidationError(
        `Attribute "${name}" is not defined as a LSI sort key in "${entityName}" Entity's metadata for index named "${index.name}".`,
      );
    }
  });
}
