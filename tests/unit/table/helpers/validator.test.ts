import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { TableDescription } from '@aws-sdk/client-dynamodb';

describe('validateTable', () => {
let getKeySchemaSpy = 
let getTableAttributeDefinitionsSpy = 
let getTableLocalSecondaryIndexesSpy = 
let getTableGlobalSecondaryIndexesSpy = 
let compareDynamodeEntityWithDynamoTableSpy = 


  const mockTable: TableDescription = {
    TableName: 'testTableName',
    KeySchema: [
      {
        AttributeName: 'partitionKey',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'sortKey',
        KeyType: 'RANGE',
      },
    ],
  };

  beforeEach(() => {
      getKeySchemaSpy = vi.spyOn(schemaHelper, 'getKeySchema'),
      getTableAttributeDefinitionsSpy = vi.spyOn(schemaHelper, 'getTableAttributeDefinitions'),
      getTableLocalSecondaryIndexesSpy = vi.spyOn(schemaHelper, 'getTableLocalSecondaryIndexes'),
      getTableGlobalSecondaryIndexesSpy = vi.spyOn(schemaHelper, 'getTableGlobalSecondaryIndexes'),
      compareDynamodeEntityWithDynamoTableSpy = vi.spyOn(schemaHelper, 'compareDynamodeEntityWithDynamoTable'),
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should validate the table correctly', () => {
    getKeySchemaSpy.mockReturnValueOnce(/*expected return here*/);
    getTableAttributeDefinitionsSpy.mockReturnValueOnce(/*expected return here*/);
    getTableLocalSecondaryIndexesSpy.mockReturnValueOnce(/*expected return here*/);
    getTableGlobalSecondaryIndexesSpy.mockReturnValueOnce(/*expected return here*/);

    const input: ValidateTableSync<typeof mockMetadata, typeof TestTable> = {
      metadata: mockMetadata,
      tableNameEntity: tableNameEntity,
      table: mockTable,
    };

    validateTable(input);

    expect(getKeySchemaSpy).toHaveBeenCalledTimes(1);
    expect(getTableAttributeDefinitionsSpy).toHaveBeenCalledTimes(1);
    expect(getTableLocalSecondaryIndexesSpy).toHaveBeenCalledTimes(1);
    expect(getTableGlobalSecondaryIndexesSpy).toHaveBeenCalledTimes(1);
    expect(compareDynamodeEntityWithDynamoTableSpy).toHaveBeenCalledTimes(4);
  });
});
