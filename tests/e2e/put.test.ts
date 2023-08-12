import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { MockEntityManager, TEST_TABLE_NAME, TestTableManager } from '../fixtures';

import { mockEntityFactory } from './mockEntityFactory';

describe.sequential('EntityManager.put', () => {
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
    test('Should be able to put an item', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });

      // Act
      await MockEntityManager.put(mock);

      // Assert
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      expect(mockEntityRetrieved).toEqual(mock);
    });

    test('Should be able to overwrite an item by default', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1', string: 'before' });
      const mockOverwrite = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1', string: 'after' });

      // Act
      await MockEntityManager.put(mock);
      await MockEntityManager.put(mockOverwrite);

      // Assert
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      expect(mockEntityRetrieved).toEqual(mockOverwrite);
    });

    test('Should not be able to put the same item with overwrite:false', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });

      // Assert
      await expect(MockEntityManager.put(mock, { overwrite: false })).rejects.toThrow('The conditional request failed');
    });

    test('Should be able to create a new item with overwrite:false', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK2', sortKey: 'SK2' });

      // Act
      await MockEntityManager.put(mock);

      // Assert
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK2', sortKey: 'SK2' });
      expect(mockEntityRetrieved).toEqual(mock);
    });

    test('Should be able to overwrite an item if condition passes', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK3', sortKey: 'SK3', string: 'before' });
      const mockOverwrite = mockEntityFactory({ partitionKey: 'PK3', sortKey: 'SK3', string: 'after' });

      // Act
      await MockEntityManager.put(mock);
      await MockEntityManager.put(mockOverwrite, {
        condition: MockEntityManager.condition().attribute('string').eq('before'),
      });

      // Assert
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK3', sortKey: 'SK3' });
      expect(mockEntityRetrieved).toEqual(mockOverwrite);
    });

    test('Should fail to overwrite an item if condition fails', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK3', sortKey: 'SK3', string: 'before' });
      const mockOverwrite = mockEntityFactory({ partitionKey: 'PK3', sortKey: 'SK3', string: 'after' });

      // Act
      await MockEntityManager.put(mock);

      // Assert
      await expect(
        MockEntityManager.put(mockOverwrite, {
          condition: MockEntityManager.condition().attribute('string').eq('after'),
        }),
      ).rejects.toThrow('The conditional request failed');

      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK3', sortKey: 'SK3' });
      expect(mockEntityRetrieved).toEqual(mock);
    });
  });
});
