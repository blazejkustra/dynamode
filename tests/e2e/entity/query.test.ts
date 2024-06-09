import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { MockEntityManager, TEST_TABLE_NAME, TestTableManager } from '../../fixtures';
import { mockEntityFactory } from '../mockEntityFactory';

describe('EntityManager.query', () => {
  beforeAll(async () => {
    vi.useFakeTimers();
    await TestTableManager.createTable();
  });

  afterAll(async () => {
    await TestTableManager.deleteTable(TEST_TABLE_NAME);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe.sequential('MockEntityManager', () => {
    test('Should be able to retrieve an item', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);

      // Act
      const mockEntityRetrieved = await MockEntityManager.query()
        .partitionKey('partitionKey')
        .eq('PK1')
        .sortKey('sortKey')
        .eq('SK1')
        .run();
      const mockEntityRetrieved2 = await MockEntityManager.query()
        .partitionKey('partitionKey')
        .eq('PK1')
        .sortKey('sortKey')
        .beginsWith('SK')
        .run();
      const mockEntityRetrieved3 = await MockEntityManager.query().partitionKey('partitionKey').eq('PK1').run();

      // Assert
      expect(mockEntityRetrieved.items[0]).toEqual(mock);
      expect(mockEntityRetrieved2.items[0]).toEqual(mock);
      expect(mockEntityRetrieved3.items[0]).toEqual(mock);

      expect(mockEntityRetrieved.count).toEqual(1);
      expect(mockEntityRetrieved2.count).toEqual(1);
      expect(mockEntityRetrieved3.count).toEqual(1);
    });

    test('Should be able to retrieve multiple items', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      const mock2 = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK2' });
      const mock3 = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK3' });
      await MockEntityManager.put(mock);
      await MockEntityManager.put(mock2);
      await MockEntityManager.put(mock3);

      // Act
      const mockEntityRetrieved = await MockEntityManager.query()
        .partitionKey('partitionKey')
        .eq('PK1')
        .sortKey('sortKey')
        .eq('SK1')
        .run();
      const mockEntityRetrieved2 = await MockEntityManager.query()
        .partitionKey('partitionKey')
        .eq('PK1')
        .sortKey('sortKey')
        .beginsWith('SK')
        .run();
      const mockEntityRetrieved3 = await MockEntityManager.query()
        .partitionKey('partitionKey')
        .eq('PK1')
        .limit(2)
        .run();

      // Assert
      expect(mockEntityRetrieved.items[0]).toEqual(mock);
      expect(mockEntityRetrieved2.items[0]).toEqual(mock);
      expect(mockEntityRetrieved2.items[1]).toEqual(mock2);
      expect(mockEntityRetrieved2.items[2]).toEqual(mock3);
      expect(mockEntityRetrieved3.items[0]).toEqual(mock);

      expect(mockEntityRetrieved.count).toEqual(1);
      expect(mockEntityRetrieved2.count).toEqual(3);
      expect(mockEntityRetrieved3.count).toEqual(2);

      expect(mockEntityRetrieved.lastKey).toEqual(undefined);
      expect(mockEntityRetrieved2.lastKey).toEqual(undefined);
      expect(mockEntityRetrieved3.lastKey).toEqual({ partitionKey: 'PK1', sortKey: 'SK2' });
    });

    test('Should throw an error if multiple indexes found', async () => {
      // Arrange
      // Act
      // Assert
      await expect(() => MockEntityManager.query().partitionKey('GSI_1_PK').eq('GPK1').run()).toThrow(
        `Multiple indexes found for "GSI_1_PK", please use ".indexName(GSI_3_NAME | GSI_1_NAME)" method to specify the index name`,
      );
    });

    test('Should automatically choose indexName for property with multiple indexes', async () => {
      // Arrange
      const mock = mockEntityFactory({
        partitionKey: 'PK1',
        sortKey: 'SK1',
        GSI_1_PK: 'GPK1',
        GSI_SK: 1,
        GSI_3_SK: 'GSK1',
      });
      const mock2 = mockEntityFactory({
        partitionKey: 'PK1',
        sortKey: 'SK2',
        GSI_1_PK: 'GPK1',
        GSI_SK: 1,
        GSI_3_SK: 'GSK1',
      });
      const mock3 = mockEntityFactory({
        partitionKey: 'PK1',
        sortKey: 'SK3',
        GSI_1_PK: 'GPK1',
        GSI_SK: 1,
        GSI_3_SK: 'GSK1',
      });
      await MockEntityManager.put(mock);
      await MockEntityManager.put(mock2);
      await MockEntityManager.put(mock3);

      // Act
      const mockEntityRetrieved = await MockEntityManager.query()
        .partitionKey('GSI_1_PK')
        .eq('GPK1')
        .sortKey('GSI_3_SK')
        .beginsWith('GSK')
        .run();

      const queryInput = await MockEntityManager.query()
        .partitionKey('GSI_1_PK')
        .eq('GPK1')
        .sortKey('GSI_SK')
        .beginsWith(1)
        .run({ return: 'input' });

      const queryInput2 = await MockEntityManager.query()
        .partitionKey('GSI_1_PK')
        .eq('GPK1')
        .sortKey('GSI_3_SK')
        .beginsWith('GSK')
        .run({ return: 'input' });

      // Assert
      expect(mockEntityRetrieved.items[0]).toEqual(mock);
      expect(mockEntityRetrieved.items[1]).toEqual(mock2);
      expect(mockEntityRetrieved.items[2]).toEqual(mock3);
      expect(mockEntityRetrieved.count).toEqual(3);
      expect(mockEntityRetrieved.lastKey).toEqual(undefined);
      expect(queryInput.IndexName).toEqual('GSI_1_NAME');
      expect(queryInput2.IndexName).toEqual('GSI_3_NAME');
    });

    test('Should be able to retrieve multiple items with pagination (on primary key)', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      const mock2 = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK2' });
      const mock3 = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK3' });
      const mock4 = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK4' });
      await MockEntityManager.put(mock);
      await MockEntityManager.put(mock2);
      await MockEntityManager.put(mock3);
      await MockEntityManager.put(mock4);

      // Act
      const mockEntityRetrieved = await MockEntityManager.query().partitionKey('partitionKey').eq('PK1').limit(2).run();
      const mockEntityRetrieved2 = await MockEntityManager.query()
        .partitionKey('partitionKey')
        .eq('PK1')
        .startAt(mockEntityRetrieved?.lastKey)
        .run();

      // Assert
      expect(mockEntityRetrieved.items[0]).toEqual(mock);
      expect(mockEntityRetrieved.items[1]).toEqual(mock2);
      expect(mockEntityRetrieved2.items[0]).toEqual(mock3);
      expect(mockEntityRetrieved2.items[1]).toEqual(mock4);

      expect(mockEntityRetrieved.count).toEqual(2);
      expect(mockEntityRetrieved2.count).toEqual(2);

      expect(mockEntityRetrieved.lastKey).toEqual({ partitionKey: 'PK1', sortKey: 'SK2' });
      expect(mockEntityRetrieved2.lastKey).toEqual(undefined);
    });

    test('Should be able to retrieve multiple items with pagination (with GSI)', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1', GSI_1_PK: 'GPK1', GSI_SK: 1 });
      const mock2 = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK2', GSI_1_PK: 'GPK1', GSI_SK: 2 });
      const mock3 = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK3', GSI_1_PK: 'GPK1', GSI_SK: 3 });
      const mock4 = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK4', GSI_1_PK: 'GPK1', GSI_SK: 4 });
      await MockEntityManager.put(mock);
      await MockEntityManager.put(mock2);
      await MockEntityManager.put(mock3);
      await MockEntityManager.put(mock4);

      // Act
      const mockEntityRetrieved = await MockEntityManager.query()
        .partitionKey('GSI_1_PK')
        .eq('GPK1')
        .indexName('GSI_1_NAME')
        .limit(2)
        .run();
      const mockEntityRetrieved2 = await MockEntityManager.query()
        .partitionKey('GSI_1_PK')
        .eq('GPK1')
        .indexName('GSI_1_NAME')
        .startAt(mockEntityRetrieved.lastKey)
        .run();

      // Assert
      expect(mockEntityRetrieved.items[0]).toEqual(mock);
      expect(mockEntityRetrieved.items[1]).toEqual(mock2);
      expect(mockEntityRetrieved2.items[0]).toEqual(mock3);
      expect(mockEntityRetrieved2.items[1]).toEqual(mock4);

      expect(mockEntityRetrieved.count).toEqual(2);
      expect(mockEntityRetrieved2.count).toEqual(2);

      expect(mockEntityRetrieved.lastKey).toEqual({
        partitionKey: 'PK1',
        sortKey: 'SK2',
        GSI_1_PK: 'GPK1',
        GSI_SK: 2,
      });
      expect(mockEntityRetrieved2.lastKey).toEqual(undefined);
    });

    test('Should fail to retrieve items without specifying partition key', async () => {
      // Arrange
      // Act
      // Assert
      await expect(() => MockEntityManager.query().limit(2).run()).toThrow(
        `You need to use ".partitionKey()" method before calling ".run()"`,
      );
    });

    test('Should fail to retrieve items without specifying index', async () => {
      // Arrange
      // Act
      // Assert
      await expect(() => MockEntityManager.query().limit(2).run()).toThrow(
        `You need to use ".partitionKey()" method before calling ".run()"`,
      );
    });
  });
});
