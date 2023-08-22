import { GlobalSecondaryIndexUpdate } from '@aws-sdk/client-dynamodb';
import { getKeySchema } from '@lib/table/helpers/schema';
import { BuildIndexCreate } from '@lib/table/types';

export function buildIndexCreate({
  indexName,
  partitionKey,
  sortKey,
  throughput,
}: BuildIndexCreate): GlobalSecondaryIndexUpdate[] {
  return [
    {
      Create: {
        IndexName: indexName,
        KeySchema: getKeySchema(partitionKey, sortKey),
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: throughput,
      },
    },
  ];
}

export function buildIndexDelete(indexName: string): GlobalSecondaryIndexUpdate[] {
  return [
    {
      Delete: {
        IndexName: indexName,
      },
    },
  ];
}
