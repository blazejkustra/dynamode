import { describe, expect, test } from 'vitest';

import { convertToAttr, convertToNative, marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import Dynamode from '@lib/dynamode/index';
import DynamodeStorage from '@lib/dynamode/storage';

import { MockEntity, TestTable } from '../../mocks';

import { DefaultError } from './../../../lib/utils/errors';
import { MockEntity, TEST_TABLE_NAME } from './../../mocks';

const metadata: any = {
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
};

describe('Dynamode', () => {
  test('Should be able to use global ddb instance', async () => {
    const DDBInstance = new Dynamode.ddb.DynamoDB({});
    Dynamode.ddb.set(DDBInstance);
    expect(Dynamode.ddb.get()).toEqual(DDBInstance);
    Dynamode.ddb.local();
    await expect(Dynamode.ddb.get().config.endpoint?.()).resolves.toEqual({
      hostname: 'localhost',
      path: '/',
      port: 8000,
      protocol: 'http:',
      query: undefined,
    });
  });

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
        expect(storage.tables[TEST_TABLE_NAME].attributes).toEqual({});
      });

      test('Should throw an error when table is registered more than once', async () => {
        expect(() => storage.registerTable(TestTable, metadata)).to.throw(DefaultError);
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

      test('Should throw an error when entity is registered more than once', async () => {
        expect(() => storage.registerEntity(MockEntity, TEST_TABLE_NAME)).to.throw(DefaultError);
      });

      test("Should throw an error when entity is registered and table isn't", async () => {
        expect(() => storage.registerEntity(MockEntity, 'unknownTableName')).to.throw(DefaultError);
      });
    });

    describe('registerAttribute', () => {
      test('Should successfully register child class property', async () => {
        storage.registerAttribute(MockEntity.name, 'propertyName', {
          propertyName: 'propertyName',
          indexName: 'indexName',
          prefix: 'prefix',
          suffix: 'suffix',
          type: String,
          role: 'partitionKey',
        });
        expect(storage.entities[MockEntity.name].attributes['propertyName'].propertyName).toEqual('propertyName');
        expect(storage.entities[MockEntity.name].attributes['propertyName'].indexName).toEqual('indexName');
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

      test('Should throw an error when class property is registered more than once', async () => {
        expect(() =>
          storage.registerAttribute(TestTable.name, 'parentPropertyName', {
            propertyName: 'parentPropertyName',
            type: Number,
            role: 'attribute',
          }),
        ).to.throw(DefaultError);
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
          },
          propertyName: {
            indexName: 'indexName',
            prefix: 'PREFIX',
            propertyName: 'propertyName',
            role: 'partitionKey',
            suffix: 'SUFFIX',
            type: String,
          },
        });
      });

      test('Should get no entity properties for unknown entity name', async () => {
        expect(storage.getEntityAttributes('unknownEntityName')).toEqual({});
      });
    });

    describe('getEntityTableName', async () => {
      test('Should successfully get entity table name', async () => {
        expect(storage.getEntityTableName(MockEntity.name)).toEqual(TEST_TABLE_NAME);
      });

      test('Should throw an error if no entity is found', async () => {
        expect(() => storage.getEntityTableName('unknownEntityName')).to.throw(DefaultError);
      });
    });

    describe('getEntityMetadata', async () => {
      test('Should successfully get entity table metadata', async () => {
        expect(storage.getEntityMetadata(MockEntity.name)).toEqual(metadata);
      });

      test('Should throw an error if no entity is found', async () => {
        expect(() => storage.getEntityMetadata('unknownEntityName')).to.throw(DefaultError);
      });

      test('Should throw an error if no table is found for entity', async () => {
        storage.entities['unknownEntityName'] = { tableName: 'unknownTableName' } as any;
        expect(() => storage.getEntityMetadata('unknownEntityName')).to.throw(DefaultError);
      });
    });
  });
});
