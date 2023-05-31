import { AttributeDefinition, KeySchemaElement, LocalSecondaryIndex } from '@aws-sdk/client-dynamodb';
import { AttributesMetadata } from '@lib/dynamode/storage/types';
import { getAttributeType } from '@lib/dynamode/storage/utils';
import Entity from '@lib/entity';
import { Metadata } from '@lib/table/types';
import { ConflictError, deepEqual } from '@lib/utils';

export function getKeySchema<M extends Metadata<TE>, TE extends typeof Entity>(metadata: M): KeySchemaElement[] {
  const { partitionKey, sortKey } = metadata;
  return [
    { AttributeName: String(partitionKey), KeyType: 'HASH' },
    ...(sortKey ? [{ AttributeName: String(sortKey), KeyType: 'RANGE' }] : []),
  ];
}

export function getTableAttributeDefinitions<M extends Metadata<TE>, TE extends typeof Entity>(
  metadata: M,
  attributes: AttributesMetadata,
): AttributeDefinition[] {
  const { partitionKey, sortKey, indexes } = metadata;

  const partitionKeyDefinition = {
    AttributeName: String(partitionKey),
    AttributeType: getAttributeType(attributes[String(partitionKey)].type),
  };

  const sortKeyDefinition = sortKey && [
    {
      AttributeName: String(sortKey),
      AttributeType: getAttributeType(attributes[String(sortKey)].type),
    },
  ];

  const indexesDefinitions =
    indexes &&
    Object.values(indexes).flatMap((index) => {
      const indexPartitionKeyDefinition = index.partitionKey && [
        {
          AttributeName: String(index.partitionKey),
          AttributeType: getAttributeType(attributes[String(index.partitionKey)].type),
        },
      ];

      const indexSortKeyDefinition = index.sortKey && [
        {
          AttributeName: String(index.sortKey),
          AttributeType: getAttributeType(attributes[String(index.sortKey)].type),
        },
      ];

      return [
        ...(indexPartitionKeyDefinition ? indexPartitionKeyDefinition : []),
        ...(indexSortKeyDefinition ? indexSortKeyDefinition : []),
      ];
    });

  return [
    partitionKeyDefinition,
    ...(sortKeyDefinition ? sortKeyDefinition : []),
    ...(indexesDefinitions ? indexesDefinitions : []),
  ];
}

export function getTableLocalSecondaryIndexes<M extends Metadata<TE>, TE extends typeof Entity>(
  metadata: M,
): LocalSecondaryIndex[] {
  const { partitionKey, indexes } = metadata;

  return Object.entries(indexes || {})
    .filter(([, index]) => !index.partitionKey && index.sortKey)
    .map(([indexName, index]) => ({
      IndexName: indexName,
      KeySchema: [
        { AttributeName: String(partitionKey), KeyType: 'HASH' },
        { AttributeName: String(index.sortKey), KeyType: 'RANGE' },
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
    }));
}

export function getTableGlobalSecondaryIndexes<M extends Metadata<TE>, TE extends typeof Entity>(
  metadata: M,
): LocalSecondaryIndex[] {
  const { indexes } = metadata;

  return Object.entries(indexes || {})
    .filter(([, index]) => index.partitionKey)
    .map(([indexName, index]) => ({
      IndexName: indexName,
      KeySchema: [
        { AttributeName: String(index.partitionKey), KeyType: 'HASH' },
        ...(index.sortKey ? [{ AttributeName: String(index.sortKey), KeyType: 'RANGE' }] : []),
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
    }));
}

export function validateTableEntityConsistency<T>(aa: T[], bb: T[]) {
  aa.forEach((a) => {
    if (!bb?.some((b) => deepEqual(a, b))) {
      throw new ConflictError(`Key "${JSON.stringify(a)}" not found in table`);
    }
  });

  bb.forEach((a) => {
    if (!aa.some((b) => deepEqual(a, b))) {
      throw new ConflictError(`Key "${JSON.stringify(a)}" not found in entity`);
    }
  });

  if (aa.length !== bb.length) {
    throw new ConflictError('Key schema length mismatch between table and entity');
  }
}
