import { GlobalSecondaryIndexUpdate } from '@aws-sdk/client-dynamodb';
import { getKeySchema } from '@lib/table/helpers/schema';
import { BuildIndexCreate } from '@lib/table/types';

export function buildIndexCreate({
  indexName,
  partitionKey,
  sortKey,
  options,
}: BuildIndexCreate): GlobalSecondaryIndexUpdate[] {
  const throughput = options?.throughput && {
    ReadCapacityUnits: options.throughput.read,
    WriteCapacityUnits: options.throughput.write,
  };

  return [
    {
      Create: {
        IndexName: indexName,
        KeySchema: getKeySchema(String(partitionKey), String(sortKey)),
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
