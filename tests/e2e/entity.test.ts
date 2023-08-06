import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { NotFoundError } from '@lib/utils';

import { MockEntity, MockEntityManager, MockEntityProps, TEST_TABLE_NAME, TestTableManager } from '../fixtures';

function mockFactory(props?: Partial<MockEntityProps>): MockEntity {
  return new MockEntity({
    partitionKey: 'PK',
    sortKey: 'SK',
    string: 'string',
    object: {
      required: 2,
    },
    map: new Map([['1', '2']]),
    set: new Set(['1', '2', '3']),
    array: ['1', '2'],
    boolean: true,
    ...props,
  });
}

describe('End to end tests', () => {
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
    test('Should create and retrieve the same item', async () => {
      const mock = mockFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      expect(mockEntityRetrieved).toEqual(mock);
    });

    test('Should fail to create the same item that already exists', async () => {
      const mock = mockFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await expect(MockEntityManager.create(mock)).rejects.toThrow('The conditional request failed');
    });

    test('Should remove the item that was created before', async () => {
      const mock = mockFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      expect(mockEntityRetrieved).toEqual(mock);

      await MockEntityManager.delete({ partitionKey: 'PK1', sortKey: 'SK1' });
      await expect(MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' })).rejects.toThrow(NotFoundError);
    });
  });
});
