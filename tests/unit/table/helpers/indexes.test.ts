import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { GlobalSecondaryIndex, LocalSecondaryIndex } from '@aws-sdk/client-dynamodb';
import { getTableGlobalSecondaryIndexes, getTableLocalSecondaryIndexes } from '@lib/table/helpers/indexes';
import * as schemaHelper from '@lib/table/helpers/schema';

import { TestTable, TestTableManager, TestTableMetadata } from '../../../fixtures';

describe('getTableLocalSecondaryIndexes', () => {
  let getKeySchemaSpy = vi.spyOn(schemaHelper, 'getKeySchema');

  beforeEach(() => {
    getKeySchemaSpy = vi.spyOn(schemaHelper, 'getKeySchema');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should return LocalSecondaryIndex array with correct KeySchema', () => {
    getKeySchemaSpy
      .mockReturnValueOnce([
        { AttributeName: TestTableManager.tableMetadata.partitionKey, KeyType: 'HASH' },
        { AttributeName: 'LSI_1_NAME', KeyType: 'RANGE' },
      ])
      .mockReturnValueOnce([
        { AttributeName: TestTableManager.tableMetadata.partitionKey, KeyType: 'HASH' },
        { AttributeName: 'sk2', KeyType: 'RANGE' },
      ]);

    const expectedResult: LocalSecondaryIndex[] = [
      {
        IndexName: 'LSI_1_NAME',
        KeySchema: [
          { AttributeName: TestTableManager.tableMetadata.partitionKey, KeyType: 'HASH' },
          { AttributeName: 'LSI_1_NAME', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ];

    expect(getTableLocalSecondaryIndexes<TestTableMetadata, typeof TestTable>(TestTableManager.tableMetadata)).toEqual(
      expectedResult,
    );
    expect(getKeySchemaSpy).toHaveBeenCalledTimes(1);
  });
});

describe('getTableGlobalSecondaryIndexes', () => {
  let getKeySchemaSpy = vi.spyOn(schemaHelper, 'getKeySchema');

  beforeEach(() => {
    getKeySchemaSpy = vi.spyOn(schemaHelper, 'getKeySchema');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should return GlobalSecondaryIndex array with correct KeySchema', () => {
    getKeySchemaSpy
      .mockReturnValueOnce([
        { AttributeName: 'GSI_1_PK', KeyType: 'HASH' },
        { AttributeName: 'GSI_1_SK', KeyType: 'RANGE' },
      ])
      .mockReturnValueOnce([
        { AttributeName: 'GSI_2_PK', KeyType: 'HASH' },
        { AttributeName: 'GSI_2_SK', KeyType: 'RANGE' },
      ]);

    const expectedResult: GlobalSecondaryIndex[] = [
      {
        IndexName: 'GSI_1_NAME',
        KeySchema: [
          { AttributeName: 'GSI_1_PK', KeyType: 'HASH' },
          { AttributeName: 'GSI_1_SK', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ];

    expect(getTableGlobalSecondaryIndexes<TestTableMetadata, typeof TestTable>(TestTableManager.tableMetadata)).toEqual(
      expectedResult,
    );
    expect(getKeySchemaSpy).toHaveBeenCalledTimes(1);
  });
});
