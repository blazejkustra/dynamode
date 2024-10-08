import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { convertToAttr, convertToNative, marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import Dynamode from '@lib/dynamode/index';
import DynamodeStorage from '@lib/dynamode/storage';
import * as storageHelper from '@lib/dynamode/storage/helpers/validator';
import { Metadata } from '@lib/table/types';
import { DynamodeStorageError, ValidationError } from '@lib/utils/errors';

import { MockEntity, TEST_TABLE_NAME, TestTable } from '../../fixtures/TestTable';

const metadata: Metadata<typeof MockEntity> = {
  tableName: TEST_TABLE_NAME,
  partitionKey: 'partitionKey',
  sortKey: 'sortKey',
  indexes: {
    GSI_1_NAME: {
      partitionKey: 'GSI_1_PK',
      sortKey: 'GSI_SK',
    },
    LSI_1_NAME: {
      sortKey: 'LSI_1_SK',
    },
  },
  createdAt: 'strDate',
  updatedAt: 'numDate',
};

describe('Dynamode', () => {
  test('Should be able to use global separator', async () => {
    expect(Dynamode.separator.get()).toEqual('#');
    Dynamode.separator.set(':');
    expect(Dynamode.separator.get()).toEqual(':');
  });

  test('Should be able to use global converter', async () => {
    expect(Dynamode.converter.get()).toEqual({
      marshall,
      unmarshall,
      convertToAttr,
      convertToNative,
    });

    const customConverter = {
      marshall: () => 'marshall' as any,
      unmarshall,
      convertToAttr,
      convertToNative,
    };

    Dynamode.converter.set(customConverter);
    expect(Dynamode.converter.get()).toEqual(customConverter);
  });

  describe('Global Dynamode storage', () => {
    const storage = new DynamodeStorage();

    describe('registerTable', () => {
      test('Should successfully register table', async () => {
        storage.registerTable(TestTable, metadata);
        expect(storage.tables[TEST_TABLE_NAME].tableEntity).toEqual(TestTable);
        expect(storage.tables[TEST_TABLE_NAME].metadata).toEqual(metadata);
      });

      test('Should throw an error when table is decorated more than once', async () => {
        expect(() => storage.registerTable(TestTable, metadata)).toThrow(DynamodeStorageError);
      });
    });

    describe('registerEntity', () => {
      test('Should successfully register entity if no attributes were added before', async () => {
        storage.registerEntity(MockEntity, TEST_TABLE_NAME);
        expect(storage.entities[MockEntity.name].entity).toEqual(MockEntity);
        expect(storage.entities[MockEntity.name].tableName).toEqual(TEST_TABLE_NAME);
        expect(storage.entities[MockEntity.name].attributes).toEqual({});
      });

      test('Should successfully register entity if attributes were added before', async () => {
        class MockEntity2 extends MockEntity {}
        storage.entities[MockEntity2.name] = { attributes: { attr: {} } } as any;

        storage.registerEntity(MockEntity2, TEST_TABLE_NAME);
        expect(storage.entities[MockEntity2.name].entity).toEqual(MockEntity2);
        expect(storage.entities[MockEntity2.name].tableName).toEqual(TEST_TABLE_NAME);
        expect(storage.entities[MockEntity2.name].attributes).toEqual({ attr: {} });
      });

      test('Should throw an error when entity is decorated more than once', async () => {
        expect(() => storage.registerEntity(MockEntity, TEST_TABLE_NAME)).toThrow(DynamodeStorageError);
      });

      test("Should throw an error when entity is decorated and table isn't", async () => {
        expect(() => storage.registerEntity(MockEntity, 'unknownTableName')).toThrow(DynamodeStorageError);
      });
    });

    describe('registerAttribute', () => {
      test('Should successfully register child class property', async () => {
        storage.registerAttribute(MockEntity.name, 'propertyName', {
          propertyName: 'propertyName',
          prefix: 'prefix',
          suffix: 'suffix',
          type: String,
          role: 'partitionKey',
        });
        expect(storage.entities[MockEntity.name].attributes['propertyName'].propertyName).toEqual('propertyName');
        expect(storage.entities[MockEntity.name].attributes['propertyName'].indexes).toEqual(undefined);
        expect(storage.entities[MockEntity.name].attributes['propertyName'].prefix).toEqual('prefix');
        expect(storage.entities[MockEntity.name].attributes['propertyName'].suffix).toEqual('suffix');
        expect(storage.entities[MockEntity.name].attributes['propertyName'].type).toEqual(String);
        expect(storage.entities[MockEntity.name].attributes['propertyName'].role).toEqual('partitionKey');
      });

      test('Should successfully register parent class property', async () => {
        storage.registerAttribute(TestTable.name, 'parentPropertyName', {
          propertyName: 'parentPropertyName',
          type: Number,
          role: 'attribute',
        });
        expect(storage.entities[TestTable.name].attributes['parentPropertyName'].propertyName).toEqual(
          'parentPropertyName',
        );
        expect(storage.entities[TestTable.name].attributes['parentPropertyName'].type).toEqual(Number);
        expect(storage.entities[TestTable.name].attributes['parentPropertyName'].role).toEqual('attribute');
      });

      test('Should throw an error when class property is decorated more than once', async () => {
        expect(() =>
          storage.registerAttribute(TestTable.name, 'parentPropertyName', {
            propertyName: 'parentPropertyName',
            type: Number,
            role: 'attribute',
          }),
        ).toThrow(DynamodeStorageError);
      });
    });

    describe('registerIndex', () => {
      test('Should successfully register index', async () => {
        storage.registerIndex(MockEntity.name, 'propertyNameIndex', {
          propertyName: 'propertyNameIndex',
          prefix: 'prefix',
          suffix: 'suffix',
          type: String,
          role: 'index',
          indexes: [{ name: 'index', role: 'gsiPartitionKey' }],
        });

        expect(storage.entities[MockEntity.name].attributes['propertyNameIndex'].propertyName).toEqual(
          'propertyNameIndex',
        );
        expect(storage.entities[MockEntity.name].attributes['propertyNameIndex'].indexes).toEqual([
          { name: 'index', role: 'gsiPartitionKey' },
        ]);
        expect(storage.entities[MockEntity.name].attributes['propertyNameIndex'].prefix).toEqual('prefix');
        expect(storage.entities[MockEntity.name].attributes['propertyNameIndex'].suffix).toEqual('suffix');
        expect(storage.entities[MockEntity.name].attributes['propertyNameIndex'].type).toEqual(String);
        expect(storage.entities[MockEntity.name].attributes['propertyNameIndex'].role).toEqual('index');
      });

      test('Should successfully register parent class property', async () => {
        storage.registerIndex(TestTable.name, 'parentPropertyNameIndex', {
          propertyName: 'parentPropertyNameIndex',
          type: Number,
          role: 'index',
          indexes: [{ name: 'index', role: 'lsiSortKey' }],
        });

        expect(storage.entities[TestTable.name].attributes['parentPropertyNameIndex'].propertyName).toEqual(
          'parentPropertyNameIndex',
        );
        expect(storage.entities[TestTable.name].attributes['parentPropertyNameIndex'].indexes).toEqual([
          { name: 'index', role: 'lsiSortKey' },
        ]);
        expect(storage.entities[TestTable.name].attributes['parentPropertyNameIndex'].type).toEqual(Number);
        expect(storage.entities[TestTable.name].attributes['parentPropertyNameIndex'].role).toEqual('index');
      });

      test('Should successfully register indexes multiple times', async () => {
        storage.registerIndex(TestTable.name, 'propertyNameIndex2', {
          propertyName: 'propertyNameIndex2',
          type: Number,
          role: 'index',
          indexes: [{ name: 'index1', role: 'lsiSortKey' }],
        });

        storage.registerIndex(TestTable.name, 'propertyNameIndex2', {
          propertyName: 'propertyNameIndex2',
          type: String,
          role: 'index',
          indexes: [{ name: 'index2', role: 'gsiSortKey' }],
        });

        expect(storage.entities[TestTable.name].attributes['propertyNameIndex2'].propertyName).toEqual(
          'propertyNameIndex2',
        );
        expect(storage.entities[TestTable.name].attributes['propertyNameIndex2'].indexes).toEqual([
          { name: 'index1', role: 'lsiSortKey' },
          { name: 'index2', role: 'gsiSortKey' },
        ]);
        expect(storage.entities[TestTable.name].attributes['propertyNameIndex2'].type).toEqual(Number);
        expect(storage.entities[TestTable.name].attributes['propertyNameIndex2'].role).toEqual('index');
      });
    });

    describe('registerAttribute and registerIndex', () => {
      test('Should successfully register attribute first then index', async () => {
        const emptyStorage = new DynamodeStorage();

        emptyStorage.registerAttribute(MockEntity.name, 'propertyName', {
          propertyName: 'propertyName',
          type: String,
          role: 'partitionKey',
        });

        emptyStorage.registerIndex(MockEntity.name, 'propertyName', {
          propertyName: 'propertyName',
          type: String,
          role: 'index',
          indexes: [{ name: 'index', role: 'gsiPartitionKey' }],
        });

        expect(emptyStorage.entities[MockEntity.name].attributes['propertyName'].propertyName).toEqual('propertyName');
        expect(emptyStorage.entities[MockEntity.name].attributes['propertyName'].indexes).toEqual([
          { name: 'index', role: 'gsiPartitionKey' },
        ]);
        expect(emptyStorage.entities[MockEntity.name].attributes['propertyName'].type).toEqual(String);
        expect(emptyStorage.entities[MockEntity.name].attributes['propertyName'].role).toEqual('partitionKey');
      });

      test('Should successfully register index first then attribute', async () => {
        const emptyStorage = new DynamodeStorage();

        emptyStorage.registerIndex(MockEntity.name, 'propertyName', {
          propertyName: 'propertyName',
          type: String,
          role: 'index',
          indexes: [{ name: 'index', role: 'gsiPartitionKey' }],
        });

        emptyStorage.registerAttribute(MockEntity.name, 'propertyName', {
          propertyName: 'propertyName',
          type: String,
          role: 'partitionKey',
        });

        expect(emptyStorage.entities[MockEntity.name].attributes['propertyName'].propertyName).toEqual('propertyName');
        expect(emptyStorage.entities[MockEntity.name].attributes['propertyName'].indexes).toEqual([
          { name: 'index', role: 'gsiPartitionKey' },
        ]);
        expect(emptyStorage.entities[MockEntity.name].attributes['propertyName'].type).toEqual(String);
        expect(emptyStorage.entities[MockEntity.name].attributes['propertyName'].role).toEqual('partitionKey');
      });
    });

    describe('updateAttributePrefix', () => {
      test('Should successfully update class property with a prefix', async () => {
        expect(storage.entities[MockEntity.name].attributes['propertyName'].prefix).toEqual('prefix');
        storage.updateAttributePrefix(MockEntity.name, 'propertyName', 'PREFIX');
        expect(storage.entities[MockEntity.name].attributes['propertyName'].prefix).toEqual('PREFIX');
      });
    });

    describe('updateAttributeSuffix', () => {
      test('Should successfully update class property with a suffix', async () => {
        expect(storage.entities[MockEntity.name].attributes['propertyName'].suffix).toEqual('suffix');
        storage.updateAttributeSuffix(MockEntity.name, 'propertyName', 'SUFFIX');
        expect(storage.entities[MockEntity.name].attributes['propertyName'].suffix).toEqual('SUFFIX');
      });
    });

    describe('getEntityAttributes', async () => {
      test('Should successfully get all entity properties (nested properties included)', async () => {
        expect(storage.getEntityAttributes(MockEntity.name)).toEqual({
          parentPropertyName: {
            propertyName: 'parentPropertyName',
            role: 'attribute',
            type: Number,
            indexes: undefined,
          },
          propertyName: {
            prefix: 'PREFIX',
            propertyName: 'propertyName',
            role: 'partitionKey',
            suffix: 'SUFFIX',
            type: String,
            indexes: undefined,
          },
          propertyNameIndex: {
            indexes: [
              {
                name: 'index',
                role: 'gsiPartitionKey',
              },
            ],
            prefix: 'prefix',
            propertyName: 'propertyNameIndex',
            role: 'index',
            suffix: 'suffix',
            type: String,
          },
          propertyNameIndex2: {
            indexes: [
              {
                name: 'index1',
                role: 'lsiSortKey',
              },
              {
                name: 'index2',
                role: 'gsiSortKey',
              },
            ],
            propertyName: 'propertyNameIndex2',
            role: 'index',
            type: Number,
          },
          parentPropertyNameIndex: {
            indexes: [
              {
                name: 'index',
                role: 'lsiSortKey',
              },
            ],
            propertyName: 'parentPropertyNameIndex',
            role: 'index',
            type: Number,
          },
        });
      });

      test('Should get no entity properties for unknown entity name', async () => {
        expect(storage.getEntityAttributes('unknownEntityName')).toEqual({});
      });
    });

    describe('getEntityClass', async () => {
      test('Should successfully get entity class', async () => {
        expect(storage.getEntityClass(MockEntity.name)).toEqual(MockEntity);
      });

      test('Should throw an error if no entity is found', async () => {
        expect(() => storage.getEntityClass('unknownEntityName')).toThrow(DynamodeStorageError);
        expect(() => storage.getEntityClass('unknownEntityName')).toThrow(`Invalid entity name "unknownEntityName"`);
      });

      test('Should throw an error if entity is not yet registered', async () => {
        class UnregisteredMockEntity extends MockEntity {}
        storage.entities[UnregisteredMockEntity.name] = { attributes: { attr: {} } } as any;

        expect(() => storage.getEntityClass(UnregisteredMockEntity.name)).toThrow(DynamodeStorageError);
        expect(() => storage.getEntityClass(UnregisteredMockEntity.name)).toThrow(
          `Entity "${UnregisteredMockEntity.name}" not registered, use TableManager.entityManager(${UnregisteredMockEntity.name}) first.`,
        );
      });
    });

    describe('getEntityTableName', async () => {
      test('Should successfully get entity table name', async () => {
        expect(storage.getEntityTableName(MockEntity.name)).toEqual(TEST_TABLE_NAME);
      });

      test('Should throw an error if no entity is found', async () => {
        expect(() => storage.getEntityTableName('unknownEntityName')).toThrow(DynamodeStorageError);
      });
    });

    describe('getEntityMetadata', async () => {
      test('Should successfully get entity table metadata', async () => {
        expect(storage.getEntityMetadata(MockEntity.name)).toEqual(metadata);
      });

      test('Should throw an error if no entity is found', async () => {
        expect(() => storage.getEntityMetadata('unknownEntityName')).toThrow(DynamodeStorageError);
      });

      test('Should throw an error if no table is found for entity', async () => {
        storage.entities['unknownEntityName'] = { tableName: 'unknownTableName' } as any;
        expect(() => storage.getEntityMetadata('unknownEntityName')).toThrow(DynamodeStorageError);
      });
    });

    describe('transferMetadata', async () => {
      test('Should transfer metadata to a different name', async () => {
        storage.registerAttribute('OLD_NAME', 'prop', {
          propertyName: 'prop',
          type: Number,
          role: 'attribute',
        });
        storage.transferMetadata('OLD_NAME', 'NEW_NAME');

        expect(storage.entities['NEW_NAME']).toEqual({
          attributes: {
            prop: {
              propertyName: 'prop',
              type: Number,
              role: 'attribute',
            },
          },
        });
        expect(storage.entities['OLD_NAME']).toEqual(undefined);
      });

      test('Should preserve metadata when the same name was used', async () => {
        storage.registerAttribute('OLD_NAME', 'prop', {
          propertyName: 'prop',
          type: Number,
          role: 'attribute',
        });
        storage.transferMetadata('OLD_NAME', 'OLD_NAME');

        expect(storage.entities['OLD_NAME']).toEqual({
          attributes: {
            prop: {
              propertyName: 'prop',
              type: Number,
              role: 'attribute',
            },
          },
        });
      });
    });

    describe('validateTableMetadata', async () => {
      let validateMetadataAttribute = vi.spyOn(storageHelper, 'validateMetadataAttribute');
      let getEntityMetadata = vi.spyOn(storage, 'getEntityMetadata');
      let getEntityAttributes = vi.spyOn(storage, 'getEntityAttributes');

      beforeEach(() => {
        validateMetadataAttribute = vi.spyOn(storageHelper, 'validateMetadataAttribute');
        getEntityMetadata = vi.spyOn(storage, 'getEntityMetadata');
        getEntityAttributes = vi.spyOn(storage, 'getEntityAttributes');
      });

      afterEach(() => {
        vi.restoreAllMocks();
      });

      test('Should successfully validate every attribute from metadata', async () => {
        getEntityMetadata.mockReturnValue(metadata);
        getEntityAttributes.mockReturnValue({});
        validateMetadataAttribute.mockReturnValue();
        storage.validateTableMetadata(TestTable.name);

        expect(validateMetadataAttribute).toHaveBeenCalledTimes(7);
        expect(validateMetadataAttribute).toHaveBeenNthCalledWith(1, {
          name: 'partitionKey',
          entityName: 'TestTable',
          validRoles: ['partitionKey'],
          attributes: {},
        });
        expect(validateMetadataAttribute).toHaveBeenNthCalledWith(2, {
          name: 'sortKey',
          entityName: 'TestTable',
          validRoles: ['sortKey'],
          attributes: {},
        });
      });

      test('Should successfully validate without indexes', async () => {
        getEntityMetadata.mockReturnValue({
          partitionKey: 'pk',
          sortKey: 'sk',
        } as any);
        getEntityAttributes.mockReturnValue({});
        validateMetadataAttribute.mockReturnValue();
        storage.validateTableMetadata(TestTable.name);

        expect(validateMetadataAttribute).toHaveBeenCalledTimes(2);
        expect(validateMetadataAttribute).toHaveBeenNthCalledWith(1, {
          name: 'pk',
          entityName: 'TestTable',
          validRoles: ['partitionKey'],
          attributes: {},
        });
        expect(validateMetadataAttribute).toHaveBeenNthCalledWith(2, {
          name: 'sk',
          entityName: 'TestTable',
          validRoles: ['sortKey'],
          attributes: {},
        });
      });

      test('Should fail for invalid index', async () => {
        getEntityMetadata.mockReturnValue({
          partitionKey: 'pk',
          indexes: {
            index: {},
          },
        } as any);
        getEntityAttributes.mockReturnValue({});
        validateMetadataAttribute.mockReturnValue();
        expect(() => storage.validateTableMetadata(TestTable.name)).toThrow(ValidationError);

        expect(validateMetadataAttribute).toHaveBeenCalledTimes(1);
        expect(validateMetadataAttribute).toHaveBeenNthCalledWith(1, {
          name: 'pk',
          entityName: 'TestTable',
          validRoles: ['partitionKey'],
          attributes: {},
        });
      });
    });
  });
});
