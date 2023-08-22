import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import * as definitionsHelper from '@lib/table/helpers/definitions';
import * as indexesHelpers from '@lib/table/helpers/indexes';
import * as schemaHelper from '@lib/table/helpers/schema';
import * as utilsHelper from '@lib/table/helpers/utils';
import { validateTable } from '@lib/table/helpers/validator';

import { tableMetadata, validTableDescription } from './fixtures';

describe('validateTable', () => {
  let getKeySchemaSpy = vi.spyOn(schemaHelper, 'getKeySchema');
  let getTableAttributeDefinitionsSpy = vi.spyOn(definitionsHelper, 'getTableAttributeDefinitions');
  let getTableLocalSecondaryIndexesSpy = vi.spyOn(indexesHelpers, 'getTableLocalSecondaryIndexes');
  let getTableGlobalSecondaryIndexesSpy = vi.spyOn(indexesHelpers, 'getTableGlobalSecondaryIndexes');
  let compareDynamodeEntityWithDynamoTableSpy = vi.spyOn(utilsHelper, 'compareDynamodeEntityWithDynamoTable');

  beforeEach(() => {
    getKeySchemaSpy = vi.spyOn(schemaHelper, 'getKeySchema');
    getTableAttributeDefinitionsSpy = vi.spyOn(definitionsHelper, 'getTableAttributeDefinitions');
    getTableLocalSecondaryIndexesSpy = vi.spyOn(indexesHelpers, 'getTableLocalSecondaryIndexes');
    getTableGlobalSecondaryIndexesSpy = vi.spyOn(indexesHelpers, 'getTableGlobalSecondaryIndexes');
    compareDynamodeEntityWithDynamoTableSpy = vi.spyOn(utilsHelper, 'compareDynamodeEntityWithDynamoTable');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should validate the table correctly', () => {
    getKeySchemaSpy.mockReturnValueOnce(validTableDescription.KeySchema);
    getTableAttributeDefinitionsSpy.mockReturnValueOnce(validTableDescription.AttributeDefinitions);
    getTableLocalSecondaryIndexesSpy.mockReturnValueOnce([
      {
        IndexName: 'LSI',
        KeySchema: [{ AttributeName: 'LSI_SK', KeyType: 'RANGE' }],
        Projection: { ProjectionType: 'ALL' },
      },
    ]);
    getTableGlobalSecondaryIndexesSpy.mockReturnValueOnce([
      {
        IndexName: 'GSI',
        KeySchema: [{ AttributeName: 'GSI_PK', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
      },
    ]);

    validateTable({
      metadata: tableMetadata as any,
      tableNameEntity: 'tableNameEntity',
      table: validTableDescription,
    });

    expect(getKeySchemaSpy).toHaveBeenCalledTimes(1);
    expect(getTableAttributeDefinitionsSpy).toHaveBeenCalledTimes(1);
    expect(getTableLocalSecondaryIndexesSpy).toHaveBeenCalledTimes(1);
    expect(getTableGlobalSecondaryIndexesSpy).toHaveBeenCalledTimes(1);
    expect(compareDynamodeEntityWithDynamoTableSpy).toHaveBeenCalledTimes(4);
  });
});
