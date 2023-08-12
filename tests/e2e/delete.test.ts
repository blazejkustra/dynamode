import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { NotFoundError } from '@lib/utils';

import { MockEntityManager, TEST_TABLE_NAME, TestTableManager } from '../fixtures';

import { mockEntityFactory } from './mockEntityFactory';

describe('EntityManager.delete', () => {
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
    test('Should be able to delete an item', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);

      // Act
      await MockEntityManager.delete({ partitionKey: 'PK1', sortKey: 'SK1' });

      // Assert
      await expect(MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' })).rejects.toThrow(NotFoundError);
    });

    test('Should be able to delete not existing item', async () => {
      // Act
      await MockEntityManager.delete({ partitionKey: 'PK1', sortKey: 'SK1' });

      // Assert
      await expect(MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' })).rejects.toThrow(NotFoundError);
    });

    test('Should throw an error if deleting not existing item with extra option', async () => {
      // Act & Assert
      await expect(
        MockEntityManager.delete({ partitionKey: 'PK1', sortKey: 'SK1' }, { throwErrorIfNotExists: true }),
      ).rejects.toThrow('The conditional request failed');
    });

    test('Should throw an error if condition is not met', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);

      // Act & Assert
      await expect(
        MockEntityManager.delete(
          { partitionKey: 'PK1', sortKey: 'SK1' },
          { condition: MockEntityManager.condition().attribute('number').not().ge(0) },
        ),
      ).rejects.toThrow('The conditional request failed');
    });

    test('Should return old values of the item', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);

      // Act
      const oldMock = await MockEntityManager.delete({ partitionKey: 'PK1', sortKey: 'SK1' });

      // Act & Assert
      expect(oldMock).toEqual(mock);
    });
  });
});
