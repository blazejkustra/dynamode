import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { DynamoDB } from '@aws-sdk/client-dynamodb';
import Dynamode from '@lib/dynamode/index';
import * as EntityManager from '@lib/entity/entityManager';
import TableManager from '@lib/table';
import * as builderHelper from '@lib/table/helpers/builders';
import * as converterHelper from '@lib/table/helpers/converters';
import * as definitionsHelper from '@lib/table/helpers/definitions';
import * as indexesHelpers from '@lib/table/helpers/indexes';
import * as schemaHelper from '@lib/table/helpers/schema';
import * as validatorHelper from '@lib/table/helpers/validator';
import { ValidationError } from '@lib/utils';

import { MockEntity, MockEntityManager, TEST_TABLE_NAME, TestTable, TestTableManager } from '../../fixtures';

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

const keySchema = [
  { AttributeName: 'PK1', KeyType: 'HASH' },
  { AttributeName: 'SK1', KeyType: 'RANGE' },
];
const definitions = [
  { AttributeName: 'PK1', AttributeType: 'S' },
  { AttributeName: 'SK1', AttributeType: 'N' },
];
const lsis = [
  {
    IndexName: 'LSI_1_NAME',
    KeySchema: [
      { AttributeName: 'PK1', KeyType: 'HASH' },
      { AttributeName: 'LSI_1_SK', KeyType: 'RANGE' },
    ],
    Projection: { ProjectionType: 'ALL' },
  },
];
const gsis = [
  {
    IndexName: 'GSI_1_NAME',
    KeySchema: [
      { AttributeName: 'GSI_1_PK', KeyType: 'HASH' },
      { AttributeName: 'GSI_1_SK', KeyType: 'RANGE' },
    ],
    Projection: { ProjectionType: 'ALL' },
  },
];
const indexCreateInput = [
  {
    Create: {
      IndexName: 'LSI_1_NAME',
      KeySchema: keySchema,
      Projection: { ProjectionType: 'ALL' },
    },
  },
];
const indexDeleteInput = [
  {
    Delete: {
      IndexName: 'GSI_1_NAME',
    },
  },
];

describe('Table', () => {
  describe('TableManager Initializers', async () => {
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

  describe('createTable', async () => {
    const createTableMock = vi.fn();

    let getTableLocalSecondaryIndexesSpy = vi.spyOn(indexesHelpers, 'getTableLocalSecondaryIndexes');
    let getTableGlobalSecondaryIndexesSpy = vi.spyOn(indexesHelpers, 'getTableGlobalSecondaryIndexes');
    let getKeySchemaSpy = vi.spyOn(schemaHelper, 'getKeySchema');
    let getTableAttributeDefinitionsSpy = vi.spyOn(definitionsHelper, 'getTableAttributeDefinitions');
    let convertToTableInformationSpy = vi.spyOn(converterHelper, 'convertToTableInformation');

    beforeEach(() => {
      vi.spyOn(Dynamode.ddb, 'get').mockReturnValue({ createTable: createTableMock } as any as DynamoDB);
      getTableLocalSecondaryIndexesSpy = vi.spyOn(indexesHelpers, 'getTableLocalSecondaryIndexes');
      getTableGlobalSecondaryIndexesSpy = vi.spyOn(indexesHelpers, 'getTableGlobalSecondaryIndexes');
      getKeySchemaSpy = vi.spyOn(schemaHelper, 'getKeySchema');
      getTableAttributeDefinitionsSpy = vi.spyOn(definitionsHelper, 'getTableAttributeDefinitions');
      convertToTableInformationSpy = vi.spyOn(converterHelper, 'convertToTableInformation');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test("Should create a table with proper parameters (return: 'input')", async () => {
      getTableLocalSecondaryIndexesSpy.mockReturnValue([]);
      getTableGlobalSecondaryIndexesSpy.mockReturnValue([]);
      getKeySchemaSpy.mockReturnValue(keySchema);
      getTableAttributeDefinitionsSpy.mockReturnValue(definitions);

      expect(TestTableManager.createTable({ return: 'input' })).toEqual({
        TableName: TEST_TABLE_NAME,
        KeySchema: keySchema,
        AttributeDefinitions: definitions,
        BillingMode: 'PAY_PER_REQUEST',
      });

      expect(getTableLocalSecondaryIndexesSpy).toBeCalledWith(TestTableManager.tableMetadata);
      expect(getTableGlobalSecondaryIndexesSpy).toBeCalledWith(TestTableManager.tableMetadata);
      expect(getKeySchemaSpy).toBeCalledWith(
        TestTableManager.tableMetadata.partitionKey,
        TestTableManager.tableMetadata.sortKey,
      );
      expect(getTableAttributeDefinitionsSpy).toBeCalledWith(
        TestTableManager.tableMetadata,
        TestTableManager.tableEntity.name,
      );

      expect(createTableMock).not.toBeCalled();
      expect(convertToTableInformationSpy).not.toBeCalled();
    });

    test('Should create a table with extra options', async () => {
      getTableLocalSecondaryIndexesSpy.mockReturnValue(lsis);
      getTableGlobalSecondaryIndexesSpy.mockReturnValue(gsis);
      getKeySchemaSpy.mockReturnValue(keySchema);
      getTableAttributeDefinitionsSpy.mockReturnValue(definitions);

      expect(
        TestTableManager.createTable({
          return: 'input',
          tags: { tag: 'test' },
          throughput: { read: 10, write: 20 },
          deletionProtection: true,
          extraInput: { BillingMode: 'TEST' },
        }),
      ).toEqual({
        TableName: TEST_TABLE_NAME,
        KeySchema: keySchema,
        AttributeDefinitions: definitions,
        LocalSecondaryIndexes: lsis,
        GlobalSecondaryIndexes: gsis,
        BillingMode: 'TEST',
        Tags: [{ Key: 'tag', Value: 'test' }],
        ProvisionedThroughput: {
          ReadCapacityUnits: 10,
          WriteCapacityUnits: 20,
        },
        DeletionProtectionEnabled: true,
      });

      expect(getTableLocalSecondaryIndexesSpy).toBeCalledWith(TestTableManager.tableMetadata);
      expect(getTableGlobalSecondaryIndexesSpy).toBeCalledWith(TestTableManager.tableMetadata);
      expect(getKeySchemaSpy).toBeCalledWith(
        TestTableManager.tableMetadata.partitionKey,
        TestTableManager.tableMetadata.sortKey,
      );
      expect(getTableAttributeDefinitionsSpy).toBeCalledWith(
        TestTableManager.tableMetadata,
        TestTableManager.tableEntity.name,
      );

      expect(createTableMock).not.toBeCalled();
      expect(convertToTableInformationSpy).not.toBeCalled();
    });

    test("Should create a table with proper parameters (return: 'output')", async () => {
      getTableLocalSecondaryIndexesSpy.mockReturnValue([]);
      getTableGlobalSecondaryIndexesSpy.mockReturnValue([]);
      getKeySchemaSpy.mockReturnValue(keySchema);
      getTableAttributeDefinitionsSpy.mockReturnValue(definitions);
      createTableMock.mockResolvedValue({ TableDescription: 'test' });

      await expect(TestTableManager.createTable({ return: 'output' })).resolves.toEqual({ TableDescription: 'test' });

      expect(getTableLocalSecondaryIndexesSpy).toBeCalledWith(TestTableManager.tableMetadata);
      expect(getTableGlobalSecondaryIndexesSpy).toBeCalledWith(TestTableManager.tableMetadata);
      expect(getKeySchemaSpy).toBeCalledWith(
        TestTableManager.tableMetadata.partitionKey,
        TestTableManager.tableMetadata.sortKey,
      );
      expect(getTableAttributeDefinitionsSpy).toBeCalledWith(
        TestTableManager.tableMetadata,
        TestTableManager.tableEntity.name,
      );
      expect(createTableMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        KeySchema: keySchema,
        AttributeDefinitions: definitions,
        BillingMode: 'PAY_PER_REQUEST',
      });

      expect(convertToTableInformationSpy).not.toBeCalled();
    });

    test("Should create a table with proper parameters (return: 'default')", async () => {
      getTableLocalSecondaryIndexesSpy.mockReturnValue([]);
      getTableGlobalSecondaryIndexesSpy.mockReturnValue([]);
      getKeySchemaSpy.mockReturnValue(keySchema);
      getTableAttributeDefinitionsSpy.mockReturnValue(definitions);
      createTableMock.mockResolvedValue({ TableDescription: 'test' });
      convertToTableInformationSpy.mockReturnValue({ tableName: 'converted' } as any);

      await expect(TestTableManager.createTable()).resolves.toEqual({ tableName: 'converted' });

      expect(getTableLocalSecondaryIndexesSpy).toBeCalledWith(TestTableManager.tableMetadata);
      expect(getTableGlobalSecondaryIndexesSpy).toBeCalledWith(TestTableManager.tableMetadata);
      expect(getKeySchemaSpy).toBeCalledWith(
        TestTableManager.tableMetadata.partitionKey,
        TestTableManager.tableMetadata.sortKey,
      );
      expect(getTableAttributeDefinitionsSpy).toBeCalledWith(
        TestTableManager.tableMetadata,
        TestTableManager.tableEntity.name,
      );
      expect(createTableMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        KeySchema: keySchema,
        AttributeDefinitions: definitions,
        BillingMode: 'PAY_PER_REQUEST',
      });
      expect(convertToTableInformationSpy).toBeCalledWith('test');
    });
  });

  describe('deleteTable', async () => {
    const deleteTableMock = vi.fn();
    let convertToTableInformationSpy = vi.spyOn(converterHelper, 'convertToTableInformation');

    beforeEach(() => {
      vi.spyOn(Dynamode.ddb, 'get').mockReturnValue({ deleteTable: deleteTableMock } as any as DynamoDB);
      convertToTableInformationSpy = vi.spyOn(converterHelper, 'convertToTableInformation');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('Should not delete table for invalid table name', async () => {
      expect(() => TestTableManager.deleteTable('wrongTableName')).toThrow(ValidationError);

      expect(deleteTableMock).not.toBeCalled();
      expect(convertToTableInformationSpy).not.toBeCalled();
    });

    test("Should delete table with proper parameters (return: 'input')", async () => {
      expect(TestTableManager.deleteTable(TEST_TABLE_NAME, { return: 'input' })).toEqual({
        TableName: TEST_TABLE_NAME,
      });

      expect(deleteTableMock).not.toBeCalled();
      expect(convertToTableInformationSpy).not.toBeCalled();
    });

    test("Should delete table with proper parameters (return: 'output')", async () => {
      deleteTableMock.mockResolvedValue({ TableDescription: 'test' });

      await expect(TestTableManager.deleteTable(TEST_TABLE_NAME, { return: 'output' })).resolves.toEqual({
        TableDescription: 'test',
      });

      expect(deleteTableMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
      });
      expect(convertToTableInformationSpy).not.toBeCalled();
    });

    test("Should delete table with proper parameters (return: 'default')", async () => {
      deleteTableMock.mockResolvedValue({ TableDescription: 'test' });
      convertToTableInformationSpy.mockReturnValue({ tableName: 'converted' } as any);

      await expect(TestTableManager.deleteTable(TEST_TABLE_NAME)).resolves.toEqual({ tableName: 'converted' });

      expect(deleteTableMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
      });
      expect(convertToTableInformationSpy).toBeCalledWith('test');
    });
  });

  describe('createTableIndex', async () => {
    const updateTableMock = vi.fn();
    let convertToTableInformationSpy = vi.spyOn(converterHelper, 'convertToTableInformation');
    let getTableAttributeDefinitionsSpy = vi.spyOn(definitionsHelper, 'getTableAttributeDefinitions');
    let buildIndexCreateSpy = vi.spyOn(builderHelper, 'buildIndexCreate');

    beforeEach(() => {
      vi.spyOn(Dynamode.ddb, 'get').mockReturnValue({ updateTable: updateTableMock } as any as DynamoDB);
      convertToTableInformationSpy = vi.spyOn(converterHelper, 'convertToTableInformation');
      getTableAttributeDefinitionsSpy = vi.spyOn(definitionsHelper, 'getTableAttributeDefinitions');
      buildIndexCreateSpy = vi.spyOn(builderHelper, 'buildIndexCreate');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('Should not create index for invalid index name', async () => {
      expect(() => TestTableManager.createTableIndex('wrongIndexName' as any, { return: 'input' })).toThrow(
        ValidationError,
      );
      expect(() => TestTableManager.createTableIndex('wrongIndexName' as any, { return: 'input' })).toThrowError(
        `Index "wrongIndexName" not decorated in TestTable entity`,
      );

      expect(updateTableMock).not.toBeCalled();
      expect(convertToTableInformationSpy).not.toBeCalled();
    });

    test('Should not be able to create index without partition key', async () => {
      expect(() => TestTableManager.createTableIndex('LSI_1_NAME', { return: 'input' })).toThrowError(
        `Index "LSI_1_NAME" doesn't have a partition key`,
      );
      expect(() => TestTableManager.createTableIndex('LSI_1_NAME', { return: 'input' })).toThrow(ValidationError);

      expect(updateTableMock).not.toBeCalled();
      expect(convertToTableInformationSpy).not.toBeCalled();
    });

    test("Should create a table index with proper parameters (return: 'input')", async () => {
      getTableAttributeDefinitionsSpy.mockReturnValue(definitions);
      buildIndexCreateSpy.mockReturnValue(indexCreateInput);

      expect(TestTableManager.createTableIndex('GSI_1_NAME', { return: 'input' })).toEqual({
        TableName: TEST_TABLE_NAME,
        AttributeDefinitions: definitions,
        GlobalSecondaryIndexUpdates: indexCreateInput,
      });

      expect(getTableAttributeDefinitionsSpy).toBeCalledWith(
        TestTableManager.tableMetadata,
        TestTableManager.tableEntity.name,
      );
      expect(buildIndexCreateSpy).toBeCalledWith({
        indexName: 'GSI_1_NAME',
        partitionKey: 'GSI_1_PK',
        sortKey: 'GSI_1_SK',
        throughput: undefined,
      });
      expect(updateTableMock).not.toBeCalled();
      expect(convertToTableInformationSpy).not.toBeCalled();
    });

    test('Should create a table index with additional options', async () => {
      getTableAttributeDefinitionsSpy.mockReturnValue(definitions);
      buildIndexCreateSpy.mockReturnValue(indexCreateInput);

      expect(
        TestTableManager.createTableIndex('GSI_1_NAME', { return: 'input', throughput: { read: 10, write: 20 } }),
      ).toEqual({
        TableName: TEST_TABLE_NAME,
        AttributeDefinitions: definitions,
        GlobalSecondaryIndexUpdates: indexCreateInput,
      });

      expect(getTableAttributeDefinitionsSpy).toBeCalledWith(
        TestTableManager.tableMetadata,
        TestTableManager.tableEntity.name,
      );
      expect(buildIndexCreateSpy).toBeCalledWith({
        indexName: 'GSI_1_NAME',
        partitionKey: 'GSI_1_PK',
        sortKey: 'GSI_1_SK',
        throughput: {
          ReadCapacityUnits: 10,
          WriteCapacityUnits: 20,
        },
      });
      expect(updateTableMock).not.toBeCalled();
      expect(convertToTableInformationSpy).not.toBeCalled();
    });

    test("Should create a table index with proper parameters (return: 'output')", async () => {
      getTableAttributeDefinitionsSpy.mockReturnValue(definitions);
      buildIndexCreateSpy.mockReturnValue(indexCreateInput);
      updateTableMock.mockResolvedValue({ TableDescription: 'test' });

      await expect(TestTableManager.createTableIndex('GSI_1_NAME', { return: 'output' })).resolves.toEqual({
        TableDescription: 'test',
      });

      expect(getTableAttributeDefinitionsSpy).toBeCalledWith(
        TestTableManager.tableMetadata,
        TestTableManager.tableEntity.name,
      );
      expect(buildIndexCreateSpy).toBeCalledWith({
        indexName: 'GSI_1_NAME',
        partitionKey: 'GSI_1_PK',
        sortKey: 'GSI_1_SK',
        throughput: undefined,
      });
      expect(updateTableMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        AttributeDefinitions: definitions,
        GlobalSecondaryIndexUpdates: indexCreateInput,
      });

      expect(convertToTableInformationSpy).not.toBeCalled();
    });

    test("Should create a table index with proper parameters (return: 'default')", async () => {
      getTableAttributeDefinitionsSpy.mockReturnValue(definitions);
      buildIndexCreateSpy.mockReturnValue(indexCreateInput);
      updateTableMock.mockResolvedValue({ TableDescription: 'test' });
      convertToTableInformationSpy.mockReturnValue({ tableName: 'converted' } as any);

      await expect(TestTableManager.createTableIndex('GSI_1_NAME')).resolves.toEqual({ tableName: 'converted' });

      expect(getTableAttributeDefinitionsSpy).toBeCalledWith(
        TestTableManager.tableMetadata,
        TestTableManager.tableEntity.name,
      );
      expect(buildIndexCreateSpy).toBeCalledWith({
        indexName: 'GSI_1_NAME',
        partitionKey: 'GSI_1_PK',
        sortKey: 'GSI_1_SK',
        throughput: undefined,
      });
      expect(updateTableMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        AttributeDefinitions: definitions,
        GlobalSecondaryIndexUpdates: indexCreateInput,
      });
      expect(convertToTableInformationSpy).toBeCalledWith('test');
    });
  });

  describe('deleteTableIndex', async () => {
    const updateTableMock = vi.fn();
    let convertToTableInformationSpy = vi.spyOn(converterHelper, 'convertToTableInformation');
    let buildIndexDeleteSpy = vi.spyOn(builderHelper, 'buildIndexDelete');

    beforeEach(() => {
      vi.spyOn(Dynamode.ddb, 'get').mockReturnValue({ updateTable: updateTableMock } as any as DynamoDB);
      convertToTableInformationSpy = vi.spyOn(converterHelper, 'convertToTableInformation');
      buildIndexDeleteSpy = vi.spyOn(builderHelper, 'buildIndexDelete');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('Should not be able to delete index when still decorated', async () => {
      expect(() => TestTableManager.deleteTableIndex('GSI_1_NAME', { return: 'input' })).toThrow(ValidationError);
      expect(() => TestTableManager.deleteTableIndex('GSI_1_NAME', { return: 'input' })).toThrowError(
        `Before deleting index "GSI_1_NAME" make sure it is no longer decorated in TestTable entity`,
      );

      expect(buildIndexDeleteSpy).not.toBeCalled();
      expect(updateTableMock).not.toBeCalled();
      expect(convertToTableInformationSpy).not.toBeCalled();
    });

    test("Should delete a table index with proper parameters (return: 'input')", async () => {
      buildIndexDeleteSpy.mockReturnValue(indexDeleteInput);

      expect(TestTableManager.deleteTableIndex('OtherIndex', { return: 'input' })).toEqual({
        TableName: TEST_TABLE_NAME,
        GlobalSecondaryIndexUpdates: indexDeleteInput,
      });

      expect(buildIndexDeleteSpy).toBeCalledWith('OtherIndex');

      expect(updateTableMock).not.toBeCalled();
      expect(convertToTableInformationSpy).not.toBeCalled();
    });

    test("Should delete a table index with proper parameters (return: 'output')", async () => {
      buildIndexDeleteSpy.mockReturnValue(indexDeleteInput);
      updateTableMock.mockResolvedValue({ TableDescription: 'test' });

      await expect(TestTableManager.deleteTableIndex('OtherIndex', { return: 'output' })).resolves.toEqual({
        TableDescription: 'test',
      });

      expect(buildIndexDeleteSpy).toBeCalledWith('OtherIndex');
      expect(updateTableMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        GlobalSecondaryIndexUpdates: indexDeleteInput,
      });
    });

    test("Should delete a table index with proper parameters (return: 'default')", async () => {
      buildIndexDeleteSpy.mockReturnValue(indexDeleteInput);
      updateTableMock.mockResolvedValue({ TableDescription: 'test' });
      convertToTableInformationSpy.mockReturnValue({ tableName: 'converted' } as any);

      await expect(TestTableManager.deleteTableIndex('OtherIndex')).resolves.toEqual({ tableName: 'converted' });

      expect(buildIndexDeleteSpy).toBeCalledWith('OtherIndex');
      expect(updateTableMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        GlobalSecondaryIndexUpdates: indexDeleteInput,
      });
      expect(convertToTableInformationSpy).toBeCalledWith('test');
    });
  });

  describe('validateTable', async () => {
    const describeTableMock = vi.fn();
    let validateTableSpy = vi.spyOn(validatorHelper, 'validateTable');
    let convertToTableInformationSpy = vi.spyOn(converterHelper, 'convertToTableInformation');

    beforeEach(() => {
      vi.spyOn(Dynamode.ddb, 'get').mockReturnValue({ describeTable: describeTableMock } as any as DynamoDB);
      validateTableSpy = vi.spyOn(validatorHelper, 'validateTable');
      convertToTableInformationSpy = vi.spyOn(converterHelper, 'convertToTableInformation');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test("Should validate a table with proper parameters (return: 'input')", async () => {
      expect(TestTableManager.validateTable({ return: 'input' })).toEqual({
        TableName: TEST_TABLE_NAME,
      });

      expect(describeTableMock).not.toBeCalled();
      expect(validateTableSpy).not.toBeCalled();
      expect(convertToTableInformationSpy).not.toBeCalled();
    });

    test("Should validate a table with proper parameters (return: 'output')", async () => {
      describeTableMock.mockResolvedValue({ Table: 'test' });
      validateTableSpy.mockReturnValue();

      await expect(TestTableManager.validateTable({ return: 'output' })).resolves.toEqual({ Table: 'test' });

      expect(describeTableMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
      });
      expect(validateTableSpy).toBeCalledWith({
        metadata: TestTableManager.tableMetadata,
        tableNameEntity: TestTableManager.tableEntity.name,
        table: 'test',
      });
      expect(convertToTableInformationSpy).not.toBeCalled();
    });

    test("Should validate a table with proper parameters (return: 'default')", async () => {
      describeTableMock.mockResolvedValue({ Table: 'test' });
      validateTableSpy.mockReturnValue();
      convertToTableInformationSpy.mockReturnValue({ tableName: 'converted' } as any);

      await expect(TestTableManager.validateTable()).resolves.toEqual({ tableName: 'converted' });

      expect(describeTableMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
      });
      expect(validateTableSpy).toBeCalledWith({
        metadata: TestTableManager.tableMetadata,
        tableNameEntity: TestTableManager.tableEntity.name,
        table: 'test',
      });
      expect(convertToTableInformationSpy).toBeCalledWith('test');
    });
  });
});
