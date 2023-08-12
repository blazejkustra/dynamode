import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { NotFoundError } from '@lib/utils';

import { MockEntityManager, TEST_TABLE_NAME, TestTableManager } from '../fixtures';

import { mockEntityFactory } from './mockEntityFactory';

describe('EntityManager.get', () => {
  beforeAll(async () => {
    vi.useFakeTimers();
    await TestTableManager.create();
  });

  afterAll(async () => {
    await TestTableManager.delete(TEST_TABLE_NAME);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe.sequential('MockEntityManager', () => {
    test('Should be able to retrieve an item', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);

      // Act
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });

      // Assert
      expect(mockEntityRetrieved).toEqual(mock);
    });

    test('Should throw an error if item is not found', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      expect(mockEntityRetrieved).toEqual(mock);

      // Act
      await MockEntityManager.delete({ partitionKey: 'PK1', sortKey: 'SK1' });

      // Assert
      await expect(MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' })).rejects.toThrow(NotFoundError);
    });

    test('Should retrieve only some of the attributes', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);

      // Act
      const mockEntityRetrieved = await MockEntityManager.get(
        { partitionKey: 'PK1', sortKey: 'SK1' },
        { attributes: ['string', 'number'] },
      );

      // Assert
      expect(mockEntityRetrieved.string).toEqual('string');
      expect(mockEntityRetrieved.number).toEqual(1);
      expect(mockEntityRetrieved.boolean).toEqual(undefined);
      expect(mockEntityRetrieved.object).toEqual(undefined);
      expect(mockEntityRetrieved.partitionKey).toEqual(undefined);
      expect(mockEntityRetrieved.sortKey).toEqual(undefined);
    });
  });
});
