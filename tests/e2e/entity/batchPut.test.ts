import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { MockEntityManager, TEST_TABLE_NAME, TestTableManager } from '../../fixtures';
import { mockEntityFactory } from '../mockEntityFactory';

describe('EntityManager.batchPut', () => {
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
    test('Should return empty arrays if an empty array is passed', async () => {
      // Act
      const { items: mocks, unprocessedItems } = await MockEntityManager.batchPut([]);

      // Assert
      expect(mocks).toEqual([]);
      expect(unprocessedItems).toEqual([]);
    });

    test('Should be able to retrieve multiple items', async () => {
      // Arrange
      const mock1 = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      const mock2 = mockEntityFactory({ partitionKey: 'PK2', sortKey: 'SK2' });
      const mock3 = mockEntityFactory({ partitionKey: 'PK3', sortKey: 'SK3' });

      // Act
      await MockEntityManager.batchPut([mock1, mock2, mock3]);

      // Assert
      const retrievedMock1 = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      const retrievedMock2 = await MockEntityManager.get({ partitionKey: 'PK2', sortKey: 'SK2' });
      const retrievedMock3 = await MockEntityManager.get({ partitionKey: 'PK3', sortKey: 'SK3' });

      expect(retrievedMock1).toEqual(mock1);
      expect(retrievedMock2).toEqual(mock2);
      expect(retrievedMock3).toEqual(mock3);
    });

    test('Should be able to put duplicates', async () => {
      // Arrange
      const mock1 = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      const mock2 = mockEntityFactory({ partitionKey: 'PK2', sortKey: 'SK2' });

      // Act & Assert
      await expect(MockEntityManager.batchPut([mock1, mock2, mock2])).rejects.toThrow(
        'Provided list of item keys contains duplicates',
      );
    });
  });
});
