import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { MockEntityManager, TEST_TABLE_NAME, TestTableManager } from '../../fixtures';
import { mockEntityFactory } from '../mockEntityFactory';

describe('EntityManager.batchGet', () => {
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
    test('Should be able to retrieve multiple items', async () => {
      // Arrange
      const mock1 = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      const mock2 = mockEntityFactory({ partitionKey: 'PK2', sortKey: 'SK2' });
      const mock3 = mockEntityFactory({ partitionKey: 'PK3', sortKey: 'SK3' });
      await MockEntityManager.put(mock1);
      await MockEntityManager.put(mock2);
      await MockEntityManager.put(mock3);

      // Act
      const { items: mocks } = await MockEntityManager.batchGet([
        { partitionKey: 'PK1', sortKey: 'SK1' },
        { partitionKey: 'PK2', sortKey: 'SK2' },
        { partitionKey: 'PK3', sortKey: 'SK3' },
      ]);

      // Assert
      expect(mocks).toEqual([mock1, mock2, mock3]);
    });

    test('Should not be able to retrieve multiple items with duplicates', async () => {
      // Arrange
      const mock1 = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      const mock2 = mockEntityFactory({ partitionKey: 'PK2', sortKey: 'SK2' });
      await MockEntityManager.put(mock1);
      await MockEntityManager.put(mock2);

      // Act & Assert
      await expect(
        MockEntityManager.batchGet([
          { partitionKey: 'PK1', sortKey: 'SK1' },
          { partitionKey: 'PK1', sortKey: 'SK1' },
        ]),
      ).rejects.toThrow('Provided list of item keys contains duplicates');
    });

    test('Should be able to retrieve only some of the attributes', async () => {
      // Arrange
      const mock1 = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      const mock2 = mockEntityFactory({ partitionKey: 'PK2', sortKey: 'SK2' });
      const mock3 = mockEntityFactory({ partitionKey: 'PK3', sortKey: 'SK3' });
      await MockEntityManager.put(mock1);
      await MockEntityManager.put(mock2);
      await MockEntityManager.put(mock3);

      // Act
      const { items: mocks } = await MockEntityManager.batchGet(
        [
          { partitionKey: 'PK1', sortKey: 'SK1' },
          { partitionKey: 'PK2', sortKey: 'SK2' },
          { partitionKey: 'PK3', sortKey: 'SK3' },
        ],
        { attributes: ['string', 'number'] },
      );

      // Assert
      expect(mocks).not.toEqual([mock1, mock2, mock3]);
      expect(mocks[0].number).toEqual(1);
      expect(mocks[0].string).toEqual('string');
      expect(mocks[0].object).toEqual(undefined);

      expect(mocks[1].number).toEqual(1);
      expect(mocks[1].string).toEqual('string');
      expect(mocks[1].object).toEqual(undefined);

      expect(mocks[2].number).toEqual(1);
      expect(mocks[2].string).toEqual('string');
      expect(mocks[2].object).toEqual(undefined);
    });
  });
});
