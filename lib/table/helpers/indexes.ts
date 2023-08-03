import { LocalSecondaryIndex } from '@aws-sdk/client-dynamodb';
import Entity from '@lib/entity';
import { getKeySchema } from '@lib/table/helpers/schema';
import { Metadata } from '@lib/table/types';

export function getTableLocalSecondaryIndexes<M extends Metadata<TE>, TE extends typeof Entity>(
  metadata: M,
): LocalSecondaryIndex[] {
  const { partitionKey, indexes } = metadata;

  return Object.entries(indexes || {})
    .filter(([, index]) => !index.partitionKey && index.sortKey)
    .map(([indexName, index]) => ({
      IndexName: indexName,
      KeySchema: getKeySchema(partitionKey, index.sortKey),
      Projection: { ProjectionType: 'ALL' },
    }));
}

export function getTableGlobalSecondaryIndexes<M extends Metadata<TE>, TE extends typeof Entity>(
  metadata: M,
): LocalSecondaryIndex[] {
  const { indexes } = metadata;

  return Object.entries(indexes || {})
    .filter(([, index]) => !!index.partitionKey)
    .map(([indexName, index]) => ({
      IndexName: indexName,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      KeySchema: getKeySchema(index.partitionKey!, index.sortKey),
      Projection: { ProjectionType: 'ALL' },
    }));
}
