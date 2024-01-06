/* eslint-disable @typescript-eslint/no-empty-function */
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { mockDate, MockEntityManager, TEST_TABLE_NAME, TestTableManager } from '../../fixtures';
import { mockEntityFactory } from '../mockEntityFactory';

describe.skip.sequential('EntityManager.update', () => {
  beforeAll(async () => {
    vi.useFakeTimers();
    await TestTableManager.createTable();
  });

  afterAll(async () => {
    try {
      await TestTableManager.deleteTable(TEST_TABLE_NAME);
    } catch (e) {
      console.error('Failed deleting a table', e);
    }
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe.sequential('MockEntityManager', () => {
    test('Should be able to create an item with MockEntityManager.update', async () => {
      // Act
      await MockEntityManager.update({ partitionKey: 'PK1', sortKey: 'SK1' }, { set: { string: 'string' } });

      // Assert
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      expect(mockEntityRetrieved.string).toEqual('string');
      expect(mockEntityRetrieved.number).toEqual(undefined);
      expect(mockEntityRetrieved.object).toEqual(undefined);
    });

    test('Should update the updatedAt automatically', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1', string: 'before' });
      await MockEntityManager.put(mock);

      // Act
      vi.setSystemTime(mockDate);
      await MockEntityManager.update({ partitionKey: 'PK1', sortKey: 'SK1' }, { set: { string: 'after' } });

      // Assert
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      expect(mockEntityRetrieved.createdAt).toEqual(mock.createdAt);
      expect(mockEntityRetrieved.updatedAt).not.toEqual(mock.updatedAt);
      expect(mockEntityRetrieved.updatedAt).toEqual(mockDate);
      expect(mockEntityRetrieved.string).toEqual('after');
    });

    test('Should update multiple fields at once', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);

      // Act
      const mockAfterUpdate = await MockEntityManager.update(
        { partitionKey: 'PK1', sortKey: 'SK1' },
        {
          set: { string: 'after' },
          setIfNotExists: { 'object.optional': 'after' },
          add: { number: 2 },
          increment: { 'object.required': 1 },
          listAppend: { array: ['3'] },
          delete: { set: new Set(['1']) },
          remove: ['boolean'],
        },
      );

      // Assert
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      expect(mockEntityRetrieved).toEqual(mockAfterUpdate);
      expect(mockEntityRetrieved.string).toEqual('after');
      expect(mockEntityRetrieved.object.optional).toEqual('after');
      expect(mockEntityRetrieved.number).toEqual(3);
      expect(mockEntityRetrieved.object.required).toEqual(3);
      expect(mockEntityRetrieved.array).toEqual(['1', '2', '3']);
      expect(mockEntityRetrieved.set).toEqual(new Set(['2', '3']));
      expect(mockEntityRetrieved.boolean).toEqual(undefined);
    });

    test('Should update.add numbers and sets', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);

      // Act
      const mockAfterUpdate = await MockEntityManager.update(
        { partitionKey: 'PK1', sortKey: 'SK1' },
        {
          add: {
            number: 9,
            set: new Set(['4']),
          },
        },
      );

      // Assert
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      expect(mockEntityRetrieved).toEqual(mockAfterUpdate);
      expect(mockEntityRetrieved.number).toEqual(10);
      expect(mockEntityRetrieved.set).toEqual(new Set(['1', '2', '3', '4']));
    });

    test('Should update.set every field', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);

      // Act
      const mockAfterUpdate = await MockEntityManager.update(
        { partitionKey: 'PK1', sortKey: 'SK1' },
        {
          set: {
            string: 'after',
            number: 2,
            object: {
              required: 3,
              optional: 'optional',
            },
            map: new Map([['1', '2']]),
            set: new Set(['1', '2', '3']),
            array: ['1', '2'],
            boolean: true,
          },
        },
      );

      // Assert
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      expect(mockEntityRetrieved).toEqual(mockAfterUpdate);
      expect(mockEntityRetrieved.string).toEqual('after');
      expect(mockEntityRetrieved.object.optional).toEqual('optional');
    });

    test('Should update.setIfNotExists every field', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);

      // Act
      const mockAfterUpdate = await MockEntityManager.update(
        { partitionKey: 'PK1', sortKey: 'SK1' },
        {
          setIfNotExists: {
            string: 'after',
            number: 2,
            object: {
              required: 3,
              optional: 'optional',
            },
            map: new Map([['1', '2']]),
            set: new Set(['1', '2', '3', '4']),
            array: ['1', '2', '3'],
            boolean: false,
          },
        },
      );

      // Assert
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      expect(mockEntityRetrieved).toEqual(mock);
      expect(mockEntityRetrieved).toEqual(mockAfterUpdate);

      // Act 2
      const mock2AfterUpdate = await MockEntityManager.update(
        { partitionKey: 'PK2', sortKey: 'SK2' },
        {
          setIfNotExists: {
            string: 'after',
            number: 2,
            object: {
              required: 3,
              optional: 'optional',
            },
            map: new Map([['1', '2']]),
            set: new Set(['1', '2', '3', '4']),
            array: ['1', '2', '3'],
            boolean: false,
          },
        },
      );

      // Assert 2
      const mock2EntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK2', sortKey: 'SK2' });
      expect(mock2EntityRetrieved).toEqual(mock2AfterUpdate);
    });

    test('Should update.listAppend an array', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);

      // Act
      const mockAfterUpdate = await MockEntityManager.update(
        { partitionKey: 'PK1', sortKey: 'SK1' },
        {
          listAppend: {
            array: ['3'],
          },
        },
      );

      // Assert
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      expect(mockEntityRetrieved).toEqual(mockAfterUpdate);
      expect(mockEntityRetrieved.array).toEqual(['1', '2', '3']);
    });

    test('Should update.increment number fields', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);

      // Act
      const mockAfterUpdate = await MockEntityManager.update(
        { partitionKey: 'PK1', sortKey: 'SK1' },
        {
          increment: {
            number: 2,
            'object.required': 1,
          },
        },
      );

      // Assert
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      expect(mockEntityRetrieved).toEqual(mockAfterUpdate);
      expect(mockEntityRetrieved.number).toEqual(3);
      expect(mockEntityRetrieved.object.required).toEqual(3);
    });

    test('Should update.decrement number fields', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);

      // Act
      const mockAfterUpdate = await MockEntityManager.update(
        { partitionKey: 'PK1', sortKey: 'SK1' },
        {
          decrement: {
            number: 1,
            'object.required': 2,
          },
        },
      );

      // Assert
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      expect(mockEntityRetrieved).toEqual(mockAfterUpdate);
      expect(mockEntityRetrieved.number).toEqual(0);
      expect(mockEntityRetrieved.object.required).toEqual(0);
    });

    test('Should update.delete values from set', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);

      // Act
      const mockAfterUpdate = await MockEntityManager.update(
        { partitionKey: 'PK1', sortKey: 'SK1' },
        {
          delete: {
            set: new Set(['1', '2']),
          },
        },
      );

      // Assert
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      expect(mockEntityRetrieved).toEqual(mockAfterUpdate);
      expect(mockEntityRetrieved.set).toEqual(new Set(['3']));
    });

    test('Should update.remove some of the fields', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);

      // Act
      const mockAfterUpdate = await MockEntityManager.update(
        { partitionKey: 'PK1', sortKey: 'SK1' },
        {
          remove: ['array', 'string', 'object.required'],
        },
      );

      // Assert
      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      expect(mockEntityRetrieved).toEqual(mockAfterUpdate);
      expect(mockEntityRetrieved.array).toEqual(undefined);
      expect(mockEntityRetrieved.string).toEqual(undefined);
      expect(mockEntityRetrieved.object.required).toEqual(undefined);
      expect(mockEntityRetrieved.number).toEqual(1);
    });

    test('Should not be able to update primary key', async () => {
      // Act & Assert
      await expect(
        MockEntityManager.update(
          { partitionKey: 'PK1', sortKey: 'SK1' },
          {
            set: {
              partitionKey: 'PK',
            },
          },
        ),
      ).rejects.toThrow(
        'One or more parameter values were invalid: Cannot update attribute partitionKey. This attribute is part of the key',
      );

      await expect(
        MockEntityManager.update(
          { partitionKey: 'PK1', sortKey: 'SK1' },
          {
            set: {
              sortKey: 'SK',
            },
          },
        ),
      ).rejects.toThrow(
        'One or more parameter values were invalid: Cannot update attribute sortKey. This attribute is part of the key',
      );
    });

    test('Should not be able to update same key twice', async () => {
      await expect(
        MockEntityManager.update(
          { partitionKey: 'PK1', sortKey: 'SK1' },
          {
            set: {
              string: 'string',
            },
            setIfNotExists: {
              string: 'string',
            },
          },
        ),
      ).rejects.toThrow(
        'Invalid UpdateExpression: Two document paths overlap with each other; must remove or rewrite one of these paths;',
      );
    });

    test('Should be able to update with condition', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);

      // Act
      const mockAfterUpdate = await MockEntityManager.update(
        { partitionKey: 'PK1', sortKey: 'SK1' },
        { set: { string: 'string' } },
        { condition: MockEntityManager.condition().attribute('object.optional').not().exists() },
      );

      // Assert
      expect(mockAfterUpdate).toEqual(mock);
    });

    test('Should be able to update with returnValues', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);

      // Act
      const mockAfterUpdate = await MockEntityManager.update(
        { partitionKey: 'PK1', sortKey: 'SK1' },
        { set: { string: 'after' } },
        { returnValues: 'allOld' },
      );

      // Assert
      expect(mockAfterUpdate).toEqual(mock);

      const mockEntityRetrieved = await MockEntityManager.get({ partitionKey: 'PK1', sortKey: 'SK1' });
      expect(mockEntityRetrieved.string).toEqual('after');
    });
  });
});
