import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import {
  TestIndexInverse,
  TestIndexInverseEntityManager,
  TestIndexInverseManager,
  TestIndexLSI,
  TestIndexLSIEntityManager,
  TestIndexLSIManager,
  TestIndexMultipleGSI,
  TestIndexMultipleGSIEntityManager,
  TestIndexMultipleGSIManager,
  TestIndexWithGSI,
  TestIndexWithGSIEntityManager,
  TestIndexWithGSIManager,
} from '../../fixtures/TestIndex';

describe('Indexes query tests', () => {
  beforeAll(async () => {
    vi.useFakeTimers();
    await TestIndexWithGSIManager.createTable();
    await TestIndexInverseManager.createTable();
    await TestIndexLSIManager.createTable();
    await TestIndexMultipleGSIManager.createTable();
  });

  afterAll(async () => {
    await TestIndexWithGSIManager.deleteTable('TestIndexWithGSI');
    await TestIndexInverseManager.deleteTable('TestIndexInverse');
    await TestIndexLSIManager.deleteTable('TestIndexLSI');
    await TestIndexMultipleGSIManager.deleteTable('TestIndexMultipleGSI');
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe.sequential('TestIndexWithGSIManager', () => {
    test('Should be able to retrieve an item with primary key', async () => {
      // Arrange
      const mock = new TestIndexWithGSI({ partitionKey: 111, sortKey: 222 });
      await TestIndexWithGSIEntityManager.put(mock);

      // Act
      const mockEntityRetrieved = await TestIndexWithGSIEntityManager.query()
        .partitionKey('partitionKey')
        .eq(111)
        .sortKey('sortKey')
        .eq(222)
        .run();
      const mockEntityRetrieved2 = await TestIndexWithGSIEntityManager.query()
        .partitionKey('partitionKey')
        .eq(111)
        .sortKey('sortKey')
        .gt(200)
        .run();
      const mockEntityRetrieved3 = await TestIndexWithGSIEntityManager.query()
        .partitionKey('partitionKey')
        .eq(111)
        .run();

      // Assert
      expect(mockEntityRetrieved.items[0]).toEqual(mock);
      expect(mockEntityRetrieved2.items[0]).toEqual(mock);
      expect(mockEntityRetrieved3.items[0]).toEqual(mock);

      expect(mockEntityRetrieved.count).toEqual(1);
      expect(mockEntityRetrieved2.count).toEqual(1);
      expect(mockEntityRetrieved3.count).toEqual(1);
    });

    test('Should be able to retrieve an item with GSI', async () => {
      // Arrange
      const mock = new TestIndexWithGSI({ partitionKey: 111, sortKey: 222 });
      await TestIndexWithGSIEntityManager.put(mock);

      // Act
      const mockEntityRetrieved = await TestIndexWithGSIEntityManager.query()
        .indexName('index-normal')
        .partitionKey('partitionKey')
        .eq(111)
        .sortKey('sortKey')
        .eq(222)
        .run();
      const mockEntityRetrieved2 = await TestIndexWithGSIEntityManager.query()
        .indexName('index-normal')
        .partitionKey('partitionKey')
        .eq(111)
        .sortKey('sortKey')
        .gt(200)
        .run();
      const mockEntityRetrieved3 = await TestIndexWithGSIEntityManager.query()
        .indexName('index-normal')
        .partitionKey('partitionKey')
        .eq(111)
        .run();

      // Assert
      expect(mockEntityRetrieved.items[0]).toEqual(mock);
      expect(mockEntityRetrieved2.items[0]).toEqual(mock);
      expect(mockEntityRetrieved3.items[0]).toEqual(mock);

      expect(mockEntityRetrieved.count).toEqual(1);
      expect(mockEntityRetrieved2.count).toEqual(1);
      expect(mockEntityRetrieved3.count).toEqual(1);
    });
  });

  describe.sequential('TestIndexInverseManager', () => {
    test('Should be able to retrieve an item with primary key', async () => {
      // Arrange
      const mock = new TestIndexInverse({ partitionKey: 111, sortKey: 222 });
      await TestIndexInverseEntityManager.put(mock);

      // Act
      const mockEntityRetrieved = await TestIndexInverseEntityManager.query()
        .partitionKey('partitionKey')
        .eq(111)
        .sortKey('sortKey')
        .eq(222)
        .run();
      const mockEntityRetrieved2 = await TestIndexInverseEntityManager.query()
        .partitionKey('partitionKey')
        .eq(111)
        .sortKey('sortKey')
        .gt(200)
        .run();
      const mockEntityRetrieved3 = await TestIndexInverseEntityManager.query()
        .partitionKey('partitionKey')
        .eq(111)
        .run();

      // Assert
      expect(mockEntityRetrieved.items[0]).toEqual(mock);
      expect(mockEntityRetrieved2.items[0]).toEqual(mock);
      expect(mockEntityRetrieved3.items[0]).toEqual(mock);

      expect(mockEntityRetrieved.count).toEqual(1);
      expect(mockEntityRetrieved2.count).toEqual(1);
      expect(mockEntityRetrieved3.count).toEqual(1);
    });

    test('Should be able to retrieve an item with GSI', async () => {
      // Arrange
      const mock = new TestIndexInverse({ partitionKey: 111, sortKey: 222 });
      await TestIndexInverseEntityManager.put(mock);

      // Act
      const mockEntityRetrieved = await TestIndexInverseEntityManager.query()
        .partitionKey('sortKey')
        .eq(222)
        .sortKey('partitionKey')
        .eq(111)
        .run();
      const mockEntityRetrieved2 = await TestIndexInverseEntityManager.query()
        .partitionKey('sortKey')
        .eq(222)
        .sortKey('partitionKey')
        .lt(200)
        .run();
      const mockEntityRetrieved3 = await TestIndexInverseEntityManager.query().partitionKey('sortKey').eq(222).run();

      // Assert
      expect(mockEntityRetrieved.items[0]).toEqual(mock);
      expect(mockEntityRetrieved2.items[0]).toEqual(mock);
      expect(mockEntityRetrieved3.items[0]).toEqual(mock);

      expect(mockEntityRetrieved.count).toEqual(1);
      expect(mockEntityRetrieved2.count).toEqual(1);
      expect(mockEntityRetrieved3.count).toEqual(1);
    });
  });

  describe.sequential('TestIndexLSIManager', () => {
    test('Should be able to retrieve an item with primary key', async () => {
      // Arrange
      const mock = new TestIndexLSI({ partitionKey: 111, sortKey: 222, otherKey: '333' });
      await TestIndexLSIEntityManager.put(mock);

      // Act
      const mockEntityRetrieved = await TestIndexLSIEntityManager.query()
        .partitionKey('partitionKey')
        .eq(111)
        .sortKey('sortKey')
        .eq(222)
        .run();
      const mockEntityRetrieved2 = await TestIndexLSIEntityManager.query()
        .partitionKey('partitionKey')
        .eq(111)
        .sortKey('sortKey')
        .gt(200)
        .run();
      const mockEntityRetrieved3 = await TestIndexLSIEntityManager.query().partitionKey('partitionKey').eq(111).run();

      // Assert
      expect(mockEntityRetrieved.items[0]).toEqual(mock);
      expect(mockEntityRetrieved2.items[0]).toEqual(mock);
      expect(mockEntityRetrieved3.items[0]).toEqual(mock);

      expect(mockEntityRetrieved.count).toEqual(1);
      expect(mockEntityRetrieved2.count).toEqual(1);
      expect(mockEntityRetrieved3.count).toEqual(1);
    });

    test('Should be able to retrieve an item with LSI', async () => {
      // Arrange
      const mock = new TestIndexLSI({ partitionKey: 111, sortKey: 222, otherKey: '333' });
      await TestIndexLSIEntityManager.put(mock);

      // Act
      const mockEntityRetrieved = await TestIndexLSIEntityManager.query()
        .partitionKey('partitionKey')
        .eq(111)
        .sortKey('otherKey')
        .eq('333')
        .run();
      const mockEntityRetrieved2 = await TestIndexLSIEntityManager.query()
        .partitionKey('partitionKey')
        .eq(111)
        .sortKey('otherKey')
        .gt('300')
        .run();
      const mockEntityRetrieved3 = await TestIndexLSIEntityManager.query()
        .indexName('index-lsi')
        .partitionKey('partitionKey')
        .eq(111)
        .run();

      // Assert
      expect(mockEntityRetrieved.items[0]).toEqual(mock);
      expect(mockEntityRetrieved2.items[0]).toEqual(mock);
      expect(mockEntityRetrieved3.items[0]).toEqual(mock);

      expect(mockEntityRetrieved.count).toEqual(1);
      expect(mockEntityRetrieved2.count).toEqual(1);
      expect(mockEntityRetrieved3.count).toEqual(1);
    });
  });

  describe.sequential('TestIndexMultipleGSIManager', () => {
    test('Should be able to retrieve an item with primary key', async () => {
      // Arrange
      const mock = new TestIndexMultipleGSI({
        partitionKey: 111,
        sortKey: 222,
        gsi_1_pk: '333',
        gsi_2_3_4_pk: 444,
        gsi_1_2_sk: 555,
        gsi_3_sk: '666',
      });
      await TestIndexMultipleGSIEntityManager.put(mock);

      // Act
      const mockEntityRetrieved = await TestIndexMultipleGSIEntityManager.query()
        .partitionKey('partitionKey')
        .eq(111)
        .sortKey('sortKey')
        .eq(222)
        .run();
      const mockEntityRetrieved2 = await TestIndexMultipleGSIEntityManager.query()
        .partitionKey('partitionKey')
        .eq(111)
        .sortKey('sortKey')
        .gt(200)
        .run();
      const mockEntityRetrieved3 = await TestIndexMultipleGSIEntityManager.query()
        .partitionKey('partitionKey')
        .eq(111)
        .run();

      // Assert
      expect(mockEntityRetrieved.items[0]).toEqual(mock);
      expect(mockEntityRetrieved2.items[0]).toEqual(mock);
      expect(mockEntityRetrieved3.items[0]).toEqual(mock);

      expect(mockEntityRetrieved.count).toEqual(1);
      expect(mockEntityRetrieved2.count).toEqual(1);
      expect(mockEntityRetrieved3.count).toEqual(1);
    });

    test('Should be able to retrieve an item with GSI number 1', async () => {
      // Arrange
      const mock = new TestIndexMultipleGSI({
        partitionKey: 111,
        sortKey: 222,
        gsi_1_pk: '333',
        gsi_2_3_4_pk: 444,
        gsi_1_2_sk: 555,
        gsi_3_sk: '666',
      });
      await TestIndexMultipleGSIEntityManager.put(mock);

      // Act
      const mockEntityRetrieved = await TestIndexMultipleGSIEntityManager.query()
        .partitionKey('gsi_1_pk')
        .eq('333')
        .sortKey('gsi_1_2_sk')
        .eq(555)
        .run();
      const mockEntityRetrieved2 = await TestIndexMultipleGSIEntityManager.query()
        .partitionKey('gsi_1_pk')
        .eq('333')
        .sortKey('gsi_1_2_sk')
        .gt(500)
        .run();
      const mockEntityRetrieved3 = await TestIndexMultipleGSIEntityManager.query()
        .partitionKey('gsi_1_pk')
        .eq('333')
        .run();

      // Assert
      expect(mockEntityRetrieved.items[0]).toEqual(mock);
      expect(mockEntityRetrieved2.items[0]).toEqual(mock);
      expect(mockEntityRetrieved3.items[0]).toEqual(mock);

      expect(mockEntityRetrieved.count).toEqual(1);
      expect(mockEntityRetrieved2.count).toEqual(1);
      expect(mockEntityRetrieved3.count).toEqual(1);
    });

    test('Should be able to retrieve an item with GSI number 2', async () => {
      // Arrange
      const mock = new TestIndexMultipleGSI({
        partitionKey: 111,
        sortKey: 222,
        gsi_1_pk: '333',
        gsi_2_3_4_pk: 444,
        gsi_1_2_sk: 555,
        gsi_3_sk: '666',
      });
      await TestIndexMultipleGSIEntityManager.put(mock);

      // Act
      const mockEntityRetrieved = await TestIndexMultipleGSIEntityManager.query()
        .partitionKey('gsi_2_3_4_pk')
        .eq(444)
        .sortKey('gsi_1_2_sk')
        .eq(555)
        .run();
      const mockEntityRetrieved2 = await TestIndexMultipleGSIEntityManager.query()
        .partitionKey('gsi_2_3_4_pk')
        .eq(444)
        .sortKey('gsi_1_2_sk')
        .gt(500)
        .run();
      const mockEntityRetrieved3 = await TestIndexMultipleGSIEntityManager.query()
        .indexName('index-2')
        .partitionKey('gsi_2_3_4_pk')
        .eq(444)
        .run();

      // Assert
      expect(mockEntityRetrieved.items[0]).toEqual(mock);
      expect(mockEntityRetrieved2.items[0]).toEqual(mock);
      expect(mockEntityRetrieved3.items[0]).toEqual(mock);

      expect(mockEntityRetrieved.count).toEqual(1);
      expect(mockEntityRetrieved2.count).toEqual(1);
      expect(mockEntityRetrieved3.count).toEqual(1);
    });

    test('Should be able to retrieve an item with GSI number 3', async () => {
      // Arrange
      const mock = new TestIndexMultipleGSI({
        partitionKey: 111,
        sortKey: 222,
        gsi_1_pk: '333',
        gsi_2_3_4_pk: 444,
        gsi_1_2_sk: 555,
        gsi_3_sk: '666',
      });
      await TestIndexMultipleGSIEntityManager.put(mock);

      // Act
      const mockEntityRetrieved = await TestIndexMultipleGSIEntityManager.query()
        .partitionKey('gsi_2_3_4_pk')
        .eq(444)
        .sortKey('gsi_3_sk')
        .eq('666')
        .run();
      const mockEntityRetrieved2 = await TestIndexMultipleGSIEntityManager.query()
        .partitionKey('gsi_2_3_4_pk')
        .eq(444)
        .sortKey('gsi_3_sk')
        .gt('600')
        .run();
      const mockEntityRetrieved3 = await TestIndexMultipleGSIEntityManager.query()
        .indexName('index-3')
        .partitionKey('gsi_2_3_4_pk')
        .eq(444)
        .run();

      // Assert
      expect(mockEntityRetrieved.items[0]).toEqual(mock);
      expect(mockEntityRetrieved2.items[0]).toEqual(mock);
      expect(mockEntityRetrieved3.items[0]).toEqual(mock);

      expect(mockEntityRetrieved.count).toEqual(1);
      expect(mockEntityRetrieved2.count).toEqual(1);
      expect(mockEntityRetrieved3.count).toEqual(1);
    });

    test('Should be able to retrieve an item with GSI number 4', async () => {
      // Arrange
      const mock = new TestIndexMultipleGSI({
        partitionKey: 111,
        sortKey: 222,
        gsi_1_pk: '333',
        gsi_2_3_4_pk: 444,
        gsi_1_2_sk: 555,
        gsi_3_sk: '666',
      });
      await TestIndexMultipleGSIEntityManager.put(mock);

      // Act
      const mockEntityRetrieved = await TestIndexMultipleGSIEntityManager.query()
        .indexName('index-4')
        .partitionKey('gsi_2_3_4_pk')
        .eq(444)
        .run();

      // Assert
      expect(mockEntityRetrieved.items[0]).toEqual(mock);
      expect(mockEntityRetrieved.count).toEqual(1);
    });
  });
});
