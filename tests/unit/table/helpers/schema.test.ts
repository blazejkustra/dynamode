import { describe, expect, test } from 'vitest';

import { KeySchemaElement } from '@aws-sdk/client-dynamodb';
import { getKeySchema } from '@lib/table/helpers/schema';

describe('getKeySchema', () => {
  // Test when only the partition key is provided
  test('Should return HASH key schema when no sort key is provided', () => {
    const partitionKey = 'PartitionKey';
    const expectedSchema: KeySchemaElement[] = [
      {
        AttributeName: partitionKey,
        KeyType: 'HASH',
      },
    ];

    const schema = getKeySchema(partitionKey);

    expect(schema).toEqual(expectedSchema);
  });

  // Test when both the partition and sort keys are provided
  test('Should return HASH and RANGE key schema when sort key is provided', () => {
    const partitionKey = 'PartitionKey';
    const sortKey = 'SortKey';
    const expectedSchema: KeySchemaElement[] = [
      {
        AttributeName: partitionKey,
        KeyType: 'HASH',
      },
      {
        AttributeName: sortKey,
        KeyType: 'RANGE',
      },
    ];

    const schema = getKeySchema(partitionKey, sortKey);

    expect(schema).toEqual(expectedSchema);
  });
});
