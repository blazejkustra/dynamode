import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { MockEntityManager, TEST_TABLE_NAME, TestTableManager } from '../../fixtures';
import { mockEntityFactory } from '../mockEntityFactory';

describe.sequential('EntityManager.create', () => {
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
    test('Should be able to create an item', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });

      // Act
      await MockEntityManager.create(mock);

      // Assert
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      expect(mockEntityRetrieved).toEqual(mock);
    });

    test('Should fail to create the same item by default', async () => {
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await expect(MockEntityManager.create(mock)).rejects.toThrow('The conditional request failed');
    });

    test('Should be able to overwrite an item by with extra option', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK2', sortKey: 'SK2', string: 'before' });
      const mockOverwrite = mockEntityFactory({ partitionKey: 'PK2', sortKey: 'SK2', string: 'after' });

      // Act
      await MockEntityManager.create(mock);
      await MockEntityManager.create(mockOverwrite, { overwrite: true });

      // Assert
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK2', sortKey: 'SK2' });
      expect(mockEntityRetrieved).toEqual(mockOverwrite);
    });
  });
});
