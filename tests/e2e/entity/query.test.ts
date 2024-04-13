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
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1', GSI_1_PK: 'GPK1', GSI_1_SK: 1 });
      const mock2 = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK2', GSI_1_PK: 'GPK1', GSI_1_SK: 2 });
      const mock3 = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK3', GSI_1_PK: 'GPK1', GSI_1_SK: 3 });
      const mock4 = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK4', GSI_1_PK: 'GPK1', GSI_1_SK: 4 });
      await MockEntityManager.put(mock);
      await MockEntityManager.put(mock2);
      await MockEntityManager.put(mock3);
      await MockEntityManager.put(mock4);

      // Act
      const mockEntityRetrieved = await MockEntityManager.query().partitionKey('GSI_1_PK').eq('GPK1').limit(2).run();
      const mockEntityRetrieved2 = await MockEntityManager.query()
        .partitionKey('GSI_1_PK')
        .eq('GPK1')
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
        GSI_1_SK: 2,
      });
      expect(mockEntityRetrieved2.lastKey).toEqual(undefined);
    });
  });
});
