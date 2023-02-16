import { describe, expect, test } from 'vitest';

import { convertToAttr, convertToNative, marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Dynamode } from '@lib/dynamode';
import { Entity } from '@lib/entity';

import { TEST_TABLE_NAME } from '../../mocks';

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

  describe('Global DynamodeStorage', () => {
    const storage = Dynamode.storage;
    class ParentEntity extends Entity {}
    class ChildEntity extends ParentEntity {}

    test('addPrimaryPartitionKeyMetadata', async () => {
      storage.addPrimaryPartitionKeyMetadata(TEST_TABLE_NAME, 'partitionKey');
      expect(storage.getTableMetadata(TEST_TABLE_NAME).partitionKey).toEqual('partitionKey');
    });

    test('addPrimarySortKeyMetadata', async () => {
      storage.addPrimarySortKeyMetadata(TEST_TABLE_NAME, 'sortKey');
      expect(storage.getTableMetadata(TEST_TABLE_NAME).sortKey).toEqual('sortKey');
    });

    test('addCreatedAtMetadata', async () => {
      storage.addCreatedAtMetadata(TEST_TABLE_NAME, 'createdAt');
      expect(storage.getTableMetadata(TEST_TABLE_NAME).createdAt).toEqual('createdAt');
    });

    test('addUpdatedAtMetadata', async () => {
      storage.addUpdatedAtMetadata(TEST_TABLE_NAME, 'updatedAt');
      expect(storage.getTableMetadata(TEST_TABLE_NAME).updatedAt).toEqual('updatedAt');
    });

    test('addGsiPartitionKeyMetadata', async () => {
      storage.addGsiPartitionKeyMetadata(TEST_TABLE_NAME, 'GSI', 'gsiPartitionKey');
      expect(storage.getGsiMetadata(TEST_TABLE_NAME, 'GSI').partitionKey).toEqual('gsiPartitionKey');
    });

    test('addGsiSortKeyMetadata', async () => {
      storage.addGsiSortKeyMetadata(TEST_TABLE_NAME, 'GSI', 'gsiSortKey');
      expect(storage.getGsiMetadata(TEST_TABLE_NAME, 'GSI').sortKey).toEqual('gsiSortKey');
    });

    test('addLsiSortKeyMetadata', async () => {
      storage.addLsiSortKeyMetadata(TEST_TABLE_NAME, 'LSI', 'lsiSortKey');
      expect(storage.getLsiMetadata(TEST_TABLE_NAME, 'LSI').sortKey).toEqual('lsiSortKey');
    });

    test('addEntityConstructor', async () => {
      storage.addEntityConstructor(TEST_TABLE_NAME, ChildEntity.name, ChildEntity);
      expect(storage.getEntityMetadata(TEST_TABLE_NAME, ChildEntity.name).entityConstructor).toEqual(ChildEntity);
    });

    test('addEntityAttributeMetadata', async () => {
      storage.addEntityAttributeMetadata(TEST_TABLE_NAME, ChildEntity.name, 'propertyName', {
        propertyName: 'propertyName',
        indexName: 'indexName',
        prefix: 'prefix',
        suffix: 'suffix',
        type: String,
        role: 'partitionKey',
      });
      expect(
        storage.getEntityAttributeMetadata(TEST_TABLE_NAME, ChildEntity.name, 'propertyName').propertyName,
      ).toEqual('propertyName');
      expect(storage.getEntityAttributeMetadata(TEST_TABLE_NAME, ChildEntity.name, 'propertyName').indexName).toEqual(
        'indexName',
      );
      expect(storage.getEntityAttributeMetadata(TEST_TABLE_NAME, ChildEntity.name, 'propertyName').prefix).toEqual(
        'prefix',
      );
      expect(storage.getEntityAttributeMetadata(TEST_TABLE_NAME, ChildEntity.name, 'propertyName').suffix).toEqual(
        'suffix',
      );
      expect(storage.getEntityAttributeMetadata(TEST_TABLE_NAME, ChildEntity.name, 'propertyName').type).toEqual(
        String,
      );
      expect(storage.getEntityAttributeMetadata(TEST_TABLE_NAME, ChildEntity.name, 'propertyName').role).toEqual(
        'partitionKey',
      );

      storage.addEntityAttributeMetadata(TEST_TABLE_NAME, ParentEntity.name, 'parentPropertyName', {
        propertyName: 'parentPropertyName',
        type: Number,
      });
      expect(
        storage.getEntityAttributeMetadata(TEST_TABLE_NAME, ParentEntity.name, 'parentPropertyName').propertyName,
      ).toEqual('parentPropertyName');
      expect(storage.getEntityAttributeMetadata(TEST_TABLE_NAME, ParentEntity.name, 'parentPropertyName').type).toEqual(
        Number,
      );
    });

    test('getEntityAttributes', async () => {
      expect(storage.getEntityAttributes(TEST_TABLE_NAME, ChildEntity.name)).toEqual({
        dynamodeEntity: {
          propertyName: 'dynamodeEntity',
          role: 'dynamodeEntity',
          type: String,
        },
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

      expect(storage.getEntityAttributes(TEST_TABLE_NAME, 'unknownEntityName')).toEqual({});
    });

    test('getGsiMetadata', async () => {
      expect(storage.getGsiMetadata(TEST_TABLE_NAME, 'GSI').partitionKey).toEqual('gsiPartitionKey');
      expect(storage.getGsiMetadata(TEST_TABLE_NAME, 'GSI').sortKey).toEqual('gsiSortKey');
    });

    test('getLsiMetadata', async () => {
      expect(storage.getLsiMetadata(TEST_TABLE_NAME, 'LSI').sortKey).toEqual('lsiSortKey');
    });

    test('getTableMetadata', async () => {
      expect(storage.getTableMetadata(TEST_TABLE_NAME)).toEqual(storage.tables[TEST_TABLE_NAME]);
    });

    test('getEntityAttributeMetadata', async () => {
      expect(storage.getEntityAttributeMetadata(TEST_TABLE_NAME, ChildEntity.name, 'propertyName')).toEqual({
        propertyName: 'propertyName',
        indexName: 'indexName',
        prefix: 'prefix',
        suffix: 'suffix',
        type: String,
        role: 'partitionKey',
      });
    });

    test('getEntityMetadata', async () => {
      expect(storage.getEntityMetadata(TEST_TABLE_NAME, ChildEntity.name)).toEqual(
        storage.tables[TEST_TABLE_NAME].entities?.[ChildEntity.name],
      );
    });
  });
});
