import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { NotFoundError } from '@lib/utils';

import { MockEntityManager, TEST_TABLE_NAME, TestTableManager } from '../../fixtures';
import { mockEntityFactory } from '../mockEntityFactory';

describe('EntityManager.batchDelete', () => {
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
    test('Should be able to delete multiple items', async () => {
      // Arrange
      const mock1 = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      const mock2 = mockEntityFactory({ partitionKey: 'PK2', sortKey: 'SK2' });
      const mock3 = mockEntityFactory({ partitionKey: 'PK3', sortKey: 'SK3' });
      await MockEntityManager.put(mock1);
      await MockEntityManager.put(mock2);
      await MockEntityManager.put(mock3);

      // Act
      await MockEntityManager.batchDelete([
        { partitionKey: 'PK1', sortKey: 'SK1' },
        { partitionKey: 'PK2', sortKey: 'SK2' },
        { partitionKey: 'PK3', sortKey: 'SK3' },
      ]);

      // Assert
      await expect(MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' })).rejects.toThrow(NotFoundError);
      await expect(MockEntityManager.get({ partitionKey: 'PK2', sortKey: 'SK2' })).rejects.toThrow(NotFoundError);
      await expect(MockEntityManager.get({ partitionKey: 'PK3', sortKey: 'SK3' })).rejects.toThrow(NotFoundError);
    });

    test('Should not be able to delete duplicated items', async () => {
      // Arrange
      const mock1 = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      const mock2 = mockEntityFactory({ partitionKey: 'PK2', sortKey: 'SK2' });
      await MockEntityManager.put(mock1);
      await MockEntityManager.put(mock2);

      // Act & Assert
      await expect(
        MockEntityManager.batchDelete([
          { partitionKey: 'PK1', sortKey: 'SK1' },
          { partitionKey: 'PK1', sortKey: 'SK1' },
        ]),
      ).rejects.toThrow('Provided list of item keys contains duplicates');
    });
  });
});
