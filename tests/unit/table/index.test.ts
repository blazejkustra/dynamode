import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import Dynamode from '@lib/dynamode/index';
import * as entity from '@lib/entity';
import { tableManager } from '@lib/table';

import { TEST_TABLE_NAME, TestTable } from '../../mocks';

import { MockEntity, mockEntityManager } from './../../mocks';

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
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
} as const;

describe('Table', () => {
  let registerTableSpy = vi.spyOn(Dynamode.storage, 'registerTable');
  let registerEntitySpy = vi.spyOn(Dynamode.storage, 'registerEntity');
  let entityManagerSpy = vi.spyOn(entity, 'entityManager');

  beforeEach(() => {
    registerTableSpy = vi.spyOn(Dynamode.storage, 'registerTable');
    registerEntitySpy = vi.spyOn(Dynamode.storage, 'registerEntity');
    entityManagerSpy = vi.spyOn(entity, 'entityManager');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('tableManager', async () => {
    test('Should properly initialize TableManager', async () => {
      registerTableSpy.mockReturnValue(undefined);
      registerEntitySpy.mockReturnValue(undefined);

      const TableManager = tableManager(TestTable).metadata(metadata);

      expect(registerTableSpy).toBeCalledWith(TestTable, metadata);
      expect(registerEntitySpy).toBeCalledWith(TestTable, TEST_TABLE_NAME);
      expect(TableManager.tableEntity).toEqual(TestTable);
      expect(TableManager.tableMetadata).toEqual(metadata);
    });

    test('Should call entityManager with proper parameters', async () => {
      registerTableSpy.mockReturnValue(undefined);
      registerEntitySpy.mockReturnValue(undefined);
      entityManagerSpy.mockReturnValue(mockEntityManager as any);

      const TableManager = tableManager(TestTable).metadata(metadata);

      expect(TableManager.entityManager(MockEntity)).toEqual(mockEntityManager);
      expect(entityManagerSpy).toBeCalledWith(MockEntity, TEST_TABLE_NAME);
    });

    test('Should call tableEntityManager with proper parameters', async () => {
      registerTableSpy.mockReturnValue(undefined);
      registerEntitySpy.mockReturnValue(undefined);
      entityManagerSpy.mockReturnValue({ testTable: 'testTable' } as any);

      const TableManager = tableManager(TestTable).metadata(metadata);

      expect(TableManager.tableEntityManager()).toEqual({ testTable: 'testTable' });
      expect(entityManagerSpy).toBeCalledWith(TestTable, TEST_TABLE_NAME);
    });
  });
});
