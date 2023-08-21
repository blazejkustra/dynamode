import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GlobalSecondaryIndexUpdate } from '@aws-sdk/client-dynamodb';
import { buildIndexCreate, buildIndexDelete } from '@lib/table/helpers/builders';
import * as schemaHelper from '@lib/table/helpers/schema';
import { BuildIndexCreate } from '@lib/table/types';

describe('buildIndexCreate', () => {
  let getKeySchemaSpy = vi.spyOn(schemaHelper, 'getKeySchema');

  beforeEach(() => {
    getKeySchemaSpy = vi.spyOn(schemaHelper, 'getKeySchema');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createInput(throughput?: { read: number; write: number }): BuildIndexCreate {
    return {
      indexName: 'Index1',
      partitionKey: 'PK1',
      sortKey: 'SK1',
      options: {
        throughput,
      },
    };
  }

  it('Should return GlobalSecondaryIndexUpdate with the correct properties', () => {
    const input = createInput({ read: 10, write: 20 });
    const keySchema = [
      { AttributeName: 'PK1', KeyType: 'HASH' },
      { AttributeName: 'SK1', KeyType: 'RANGE' },
    ];
    getKeySchemaSpy.mockReturnValue(keySchema);

    const expectedOutput: GlobalSecondaryIndexUpdate[] = [
      {
        Create: {
          IndexName: 'Index1',
          KeySchema: keySchema,
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 20,
          },
        },
      },
    ];

    const result = buildIndexCreate(input);
    expect(result).toEqual(expectedOutput);
    expect(getKeySchemaSpy).toHaveBeenCalledTimes(1);
  });

  it('Should return GlobalSecondaryIndexUpdate without ProvisionedThroughput when throughput is not provided', () => {
    const input = createInput();
    getKeySchemaSpy.mockReturnValue([
      { AttributeName: 'PK1', KeyType: 'HASH' },
      { AttributeName: 'SK1', KeyType: 'RANGE' },
    ]);

    const expectedOutput: GlobalSecondaryIndexUpdate[] = [
      {
        Create: {
          IndexName: 'Index1',
          KeySchema: [
            { AttributeName: 'PK1', KeyType: 'HASH' },
            { AttributeName: 'SK1', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
        },
      },
    ];

    const result = buildIndexCreate(input);
    expect(result).toEqual(expectedOutput);
    expect(getKeySchemaSpy).toHaveBeenCalledTimes(1);
  });
});

describe('buildIndexDelete', () => {
  it('Should return GlobalSecondaryIndexUpdate array with Delete action for provided indexName', () => {
    const indexName = 'Index1';
    const expectedOutput: GlobalSecondaryIndexUpdate[] = [
      {
        Delete: {
          IndexName: indexName,
        },
      },
    ];

    const result = buildIndexDelete(indexName);
    expect(result).toEqual(expectedOutput);
  });
});
