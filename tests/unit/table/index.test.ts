import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import Dynamode from '@lib/dynamode/index';
import * as EntityManager from '@lib/entity/entityManager';
import TableManager from '@lib/table';

import { MockEntity, MockEntityManager, TEST_TABLE_NAME, TestTable } from '../../fixtures';

const metadata = {
  tableName: TEST_TABLE_NAME,
  partitionKey: 'partitionKey',
  sortKey: 'sortKey',
  indexes: {
    GSI_1_NAME: {
      partitionKey: 'GSI_1_PK',
      sortKey: 'GSI_1_SK',
    },
    LSI_1_NAME: {
      sortKey: 'LSI_1_SK',
    },
  },
} as const;

describe('Table', () => {
  describe('TableManager', async () => {
    describe('Initializers', async () => {
      let registerTableSpy = vi.spyOn(Dynamode.storage, 'registerTable');
      let registerEntitySpy = vi.spyOn(Dynamode.storage, 'registerEntity');
      let entityManagerSpy = vi.spyOn(EntityManager, 'default');

      beforeEach(() => {
        registerTableSpy = vi.spyOn(Dynamode.storage, 'registerTable');
        registerEntitySpy = vi.spyOn(Dynamode.storage, 'registerEntity');
        entityManagerSpy = vi.spyOn(EntityManager, 'default');
      });

      afterEach(() => {
        vi.restoreAllMocks();
      });

      test('Should properly initialize TableManager', async () => {
        registerTableSpy.mockReturnValue(undefined);
        registerEntitySpy.mockReturnValue(undefined);

        const TestTableManager = new TableManager(TestTable, metadata);

        expect(registerTableSpy).toBeCalledWith(TestTable, metadata);
        expect(registerEntitySpy).toBeCalledWith(TestTable, TEST_TABLE_NAME);
        expect(TestTableManager.tableEntity).toEqual(TestTable);
        expect(TestTableManager.tableMetadata).toEqual(metadata);
      });

      test('Should call entityManager with proper parameters', async () => {
        registerTableSpy.mockReturnValue(undefined);
        registerEntitySpy.mockReturnValue(undefined);
        entityManagerSpy.mockReturnValue(MockEntityManager as any);

        const TestTableManager = new TableManager(TestTable, metadata);

        expect(TestTableManager.entityManager(MockEntity)).toEqual(MockEntityManager);
        expect(entityManagerSpy).toBeCalledWith(MockEntity, TEST_TABLE_NAME);
      });

      test('Should call tableEntityManager with proper parameters', async () => {
        registerTableSpy.mockReturnValue(undefined);
        registerEntitySpy.mockReturnValue(undefined);
        entityManagerSpy.mockReturnValue({ testTable: 'testTable' } as any);

        const TestTableManager = new TableManager(TestTable, metadata);

        expect(TestTableManager.entityManager()).toEqual({ testTable: 'testTable' });
        expect(entityManagerSpy).toBeCalledWith(TestTable, TEST_TABLE_NAME);
      });
    });

    // describe('create', async () => {
    //   test('Should create a table with proper parameters', async () => {});
    // });
  });
});
