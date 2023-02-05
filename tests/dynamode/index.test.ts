import { describe, expect, test } from 'vitest';

import { convertToAttr, convertToNative, marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import Dynamode from '@lib/dynamode/index';
import type { Entity } from '@lib/entity/types';

describe('Dynamode', () => {
  test('Should be able to use global ddb instance', async () => {
    const DDBInstance = new Dynamode.ddb.DynamoDB({});
    Dynamode.ddb.set(DDBInstance);
    expect(Dynamode.ddb.get()).toEqual(DDBInstance);
    Dynamode.ddb.local();
    await expect(Dynamode.ddb.get().config.endpoint()).resolves.toEqual({
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

  describe('Global DynamodeStorage', () => {
    const storage = Dynamode.storage;
    const tableName = 'tableName';
    const entityName = 'entityName';
    const parentEntityName = 'parentEntityName';
    // TODO: use mocks.ts here
    const parentEntityConstructor = { name: parentEntityName } as Entity<any>;
    const entityConstructor = { name: entityName } as Entity<any>;
    Object.setPrototypeOf(entityConstructor, parentEntityConstructor);

    test('addPrimaryPartitionKeyMetadata', async () => {
      storage.addPrimaryPartitionKeyMetadata(tableName, 'partitionKey');
      expect(storage.getTableMetadata(tableName).partitionKey).toEqual('partitionKey');
    });

    test('addPrimarySortKeyMetadata', async () => {
      storage.addPrimarySortKeyMetadata(tableName, 'sortKey');
      expect(storage.getTableMetadata(tableName).sortKey).toEqual('sortKey');
    });

    test('addCreatedAtMetadata', async () => {
      storage.addCreatedAtMetadata(tableName, 'createdAt');
      expect(storage.getTableMetadata(tableName).createdAt).toEqual('createdAt');
    });

    test('addUpdatedAtMetadata', async () => {
      storage.addUpdatedAtMetadata(tableName, 'updatedAt');
      expect(storage.getTableMetadata(tableName).updatedAt).toEqual('updatedAt');
    });

    test('addGsiPartitionKeyMetadata', async () => {
      storage.addGsiPartitionKeyMetadata(tableName, 'GSI', 'gsiPartitionKey');
      expect(storage.getGsiMetadata(tableName, 'GSI').partitionKey).toEqual('gsiPartitionKey');
    });

    test('addGsiSortKeyMetadata', async () => {
      storage.addGsiSortKeyMetadata(tableName, 'GSI', 'gsiSortKey');
      expect(storage.getGsiMetadata(tableName, 'GSI').sortKey).toEqual('gsiSortKey');
    });

    test('addLsiSortKeyMetadata', async () => {
      storage.addLsiSortKeyMetadata(tableName, 'LSI', 'lsiSortKey');
      expect(storage.getLsiMetadata(tableName, 'LSI').sortKey).toEqual('lsiSortKey');
    });

    test('addEntityConstructor', async () => {
      storage.addEntityConstructor(tableName, entityName, entityConstructor);
      expect(storage.getEntityMetadata(tableName, entityName).entityConstructor).toEqual(entityConstructor);
    });

    test('addEntityAttributeMetadata', async () => {
      storage.addEntityAttributeMetadata(tableName, entityName, 'propertyName', {
        propertyName: 'propertyName',
        indexName: 'indexName',
        prefix: 'prefix',
        suffix: 'suffix',
        type: String,
        role: 'partitionKey',
      });
      expect(storage.getEntityAttributeMetadata(tableName, entityName, 'propertyName').propertyName).toEqual('propertyName');
      expect(storage.getEntityAttributeMetadata(tableName, entityName, 'propertyName').indexName).toEqual('indexName');
      expect(storage.getEntityAttributeMetadata(tableName, entityName, 'propertyName').prefix).toEqual('prefix');
      expect(storage.getEntityAttributeMetadata(tableName, entityName, 'propertyName').suffix).toEqual('suffix');
      expect(storage.getEntityAttributeMetadata(tableName, entityName, 'propertyName').type).toEqual(String);
      expect(storage.getEntityAttributeMetadata(tableName, entityName, 'propertyName').role).toEqual('partitionKey');

      storage.addEntityAttributeMetadata(tableName, parentEntityName, 'parentPropertyName', {
        propertyName: 'parentPropertyName',
        type: Number,
      });
      expect(storage.getEntityAttributeMetadata(tableName, parentEntityName, 'parentPropertyName').propertyName).toEqual('parentPropertyName');
      expect(storage.getEntityAttributeMetadata(tableName, parentEntityName, 'parentPropertyName').type).toEqual(Number);
    });

    test('getEntityAttributes', async () => {
      expect(storage.getEntityAttributes(tableName, entityName)).toEqual({
        parentPropertyName: {
          propertyName: 'parentPropertyName',
          type: Number,
        },
        propertyName: {
          indexName: 'indexName',
          prefix: 'prefix',
          propertyName: 'propertyName',
          role: 'partitionKey',
          suffix: 'suffix',
          type: String,
        },
      });

      expect(storage.getEntityAttributes(tableName, 'unknownEntityName')).toEqual({});
    });

    test('getGsiMetadata', async () => {
      expect(storage.getGsiMetadata(tableName, 'GSI').partitionKey).toEqual('gsiPartitionKey');
      expect(storage.getGsiMetadata(tableName, 'GSI').sortKey).toEqual('gsiSortKey');
    });

    test('getLsiMetadata', async () => {
      expect(storage.getLsiMetadata(tableName, 'LSI').sortKey).toEqual('lsiSortKey');
    });

    test('getTableMetadata', async () => {
      expect(storage.getTableMetadata(tableName)).toEqual(storage.tables[tableName]);
    });

    test('getEntityAttributeMetadata', async () => {
      expect(storage.getEntityAttributeMetadata(tableName, entityName, 'propertyName')).toEqual({
        propertyName: 'propertyName',
        indexName: 'indexName',
        prefix: 'prefix',
        suffix: 'suffix',
        type: String,
        role: 'partitionKey',
      });
    });

    test('getEntityMetadata', async () => {
      expect(storage.getEntityMetadata(tableName, entityName)).toEqual(storage.tables[tableName].entities?.[entityName]);
    });
  });
});
