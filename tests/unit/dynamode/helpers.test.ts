import { describe, expect, test } from 'vitest';

import {
  validateDecoratedAttribute,
  validateMetadataAttribute,
  validateMetadataUniqueness,
} from '@lib/dynamode/storage/helpers/validator';
import { AttributesMetadata } from '@lib/dynamode/storage/types';
import { Metadata } from '@lib/table/types';

import { MockEntity, TEST_TABLE_NAME } from '../../fixtures';

const entityName = 'EntityName';
const attributes: AttributesMetadata = {
  partitionKey: {
    propertyName: 'partitionKey',
    type: String,
    role: 'partitionKey',
    indexName: undefined,
    prefix: 'prefix',
    suffix: undefined,
  },
  sortKey: {
    propertyName: 'sortKey',
    type: String,
    role: 'sortKey',
    indexName: undefined,
    prefix: undefined,
    suffix: undefined,
  },
  GSI_1_PK: {
    propertyName: 'GSI_1_PK',
    type: String,
    role: 'index',
    indexes: [{ name: 'GSI_1_NAME', role: 'gsiPartitionKey' }],
    prefix: undefined,
    suffix: undefined,
  },
  GSI_2_PK: {
    propertyName: 'GSI_2_PK',
    type: String,
    role: 'index',
    indexes: [{ name: 'GSI_2_NAME', role: 'gsiPartitionKey' }],
    prefix: undefined,
    suffix: undefined,
  },
  GSI_SK: {
    propertyName: 'GSI_SK',
    type: Number,
    role: 'index',
    indexes: [
      { name: 'GSI_1_NAME', role: 'gsiSortKey' },
      { name: 'GSI_2_NAME', role: 'gsiSortKey' },
    ],
    prefix: undefined,
    suffix: undefined,
  },
  LSI_1_SK: {
    propertyName: 'LSI_1_SK',
    type: Number,
    role: 'index',
    indexes: [{ name: 'LSI_1_NAME', role: 'gsiSortKey' }],
    prefix: undefined,
    suffix: undefined,
  },
  strDate: {
    propertyName: 'strDate',
    type: String,
    role: 'date',
    indexName: undefined,
    prefix: undefined,
    suffix: undefined,
  },
  numDate: {
    propertyName: 'numDate',
    type: Number,
    role: 'date',
    indexName: undefined,
    prefix: undefined,
    suffix: undefined,
  },
  attr: {
    propertyName: 'attr',
    type: String,
    role: 'attribute',
    indexName: undefined,
    prefix: undefined,
    suffix: undefined,
  },
};

const metadata: Metadata<typeof MockEntity> = {
  tableName: TEST_TABLE_NAME,
  partitionKey: 'partitionKey',
  sortKey: 'sortKey',
  indexes: {
    GSI_1_NAME: {
      partitionKey: 'GSI_1_PK',
      sortKey: 'GSI_SK',
    },
    GSI_2_NAME: {
      partitionKey: 'GSI_2_PK',
      sortKey: 'GSI_SK',
    },
    LSI_1_NAME: {
      sortKey: 'LSI_1_SK',
    },
  },
  createdAt: 'strDate',
  updatedAt: 'numDate',
};

const metadataInvalid: Metadata<typeof MockEntity> = {
  tableName: TEST_TABLE_NAME,
  partitionKey: 'partitionKey',
  sortKey: 'sortKey',
  indexes: {
    GSI_1_NAME: {
      partitionKey: 'partitionKey',
      sortKey: 'GSI_SK',
    },
    LSI_1_NAME: {
      sortKey: 'LSI_1_SK',
    },
  },
  createdAt: 'strDate',
  updatedAt: 'numDate',
};

describe('Dynamode helpers', () => {
  describe('validateMetadataAttribute', async () => {
    test('Should successfully validate attributes', async () => {
      expect(
        validateMetadataAttribute({
          name: 'partitionKey',
          role: 'partitionKey',
          attributes: { partitionKey: attributes.partitionKey },
          entityName,
        }),
      ).toBeUndefined();
      expect(
        validateMetadataAttribute({
          name: 'sortKey',
          role: 'sortKey',
          attributes: { sortKey: attributes.sortKey },
          entityName,
        }),
      ).toBeUndefined();
      expect(
        validateMetadataAttribute({
          name: 'GSI_1_PK',
          role: 'index', // TODO: validate this
          attributes: { GSI_1_PK: attributes.GSI_1_PK },
          indexName: 'GSI_1_NAME',
          entityName,
        }),
      ).toBeUndefined();
      expect(
        validateMetadataAttribute({
          name: 'GSI_SK',
          role: 'index', // TODO: validate this
          attributes: { GSI_SK: attributes.GSI_SK },
          indexName: 'GSI_1_NAME',
          entityName,
        }),
      ).toBeUndefined();
      expect(
        validateMetadataAttribute({
          name: 'LSI_1_SK',
          role: 'index', // TODO: validate this
          attributes: { LSI_1_SK: attributes.LSI_1_SK },
          indexName: 'LSI_1_NAME',
          entityName,
        }),
      ).toBeUndefined();
    });

    test("Should throw an error if attribute isn't decorated", async () => {
      expect(() =>
        validateMetadataAttribute({ name: 'name', role: 'partitionKey', attributes: {}, entityName }),
      ).toThrowError(/^Attribute ".*" should be decorated in "EntityName" Entity.$/);
    });

    test("Should throw an error if attribute roles doesn't match", async () => {
      expect(() =>
        validateMetadataAttribute({
          name: 'partitionKey',
          role: 'sortKey',
          attributes: { partitionKey: attributes.partitionKey },
          entityName,
        }),
      ).toThrowError(/^Attribute ".*" is decorated with a wrong role in "EntityName" Entity.*/);
    });

    test('Should throw an error for indexName mismatch', async () => {
      expect(() =>
        validateMetadataAttribute({
          name: 'sortKey',
          role: 'sortKey',
          attributes: { sortKey: attributes.sortKey },
          indexName: 'indexName',
          entityName,
        }),
      ).toThrowError(/^Attribute ".*" should be decorated with index "indexName" in "EntityName" Entity.$/);
      expect(() =>
        validateMetadataAttribute({
          name: 'GSI_SK',
          role: 'index',
          attributes: { GSI_SK: attributes.GSI_SK },
          indexName: 'indexName',
          entityName,
        }),
      ).toThrowError(/^Attribute ".*" is not decorated with index "indexName" in "EntityName" Entity.$/);
      expect(() =>
        validateMetadataAttribute({
          name: 'GSI_SK',
          role: 'index',
          attributes: { GSI_SK: attributes.GSI_SK },
          entityName,
        }),
      ).toThrowError(/^Index for attribute ".*" should be added to "EntityName" Entity metadata.$/);
    });

    test("Should throw an error if attribute roles doesn't match", async () => {
      expect(() =>
        validateMetadataAttribute({
          name: 'partitionKey',
          role: 'partitionKey',
          attributes: { partitionKey: { ...attributes.partitionKey, type: Date as any } },
          entityName,
        }),
      ).toThrowError(/^Attribute ".*" is decorated with invalid type in "EntityName" Entity.$/);
    });
  });

  describe('validateDecoratedAttribute', async () => {
    test('Should successfully validate decorated attributes', async () => {
      expect(
        validateDecoratedAttribute({ name: 'partitionKey', attribute: attributes.partitionKey, entityName, metadata }),
      ).toBeUndefined();

      expect(
        validateDecoratedAttribute({ name: 'sortKey', attribute: attributes.sortKey, entityName, metadata }),
      ).toBeUndefined();

      expect(
        validateDecoratedAttribute({ name: 'GSI_1_PK', attribute: attributes.GSI_1_PK, entityName, metadata }),
      ).toBeUndefined();

      expect(
        validateDecoratedAttribute({ name: 'GSI_SK', attribute: attributes.GSI_SK, entityName, metadata }),
      ).toBeUndefined();

      expect(
        validateDecoratedAttribute({ name: 'LSI_1_SK', attribute: attributes.LSI_1_SK, entityName, metadata }),
      ).toBeUndefined();

      expect(
        validateDecoratedAttribute({ name: 'strDate', attribute: attributes.strDate, entityName, metadata }),
      ).toBeUndefined();

      expect(
        validateDecoratedAttribute({ name: 'numDate', attribute: attributes.numDate, entityName, metadata }),
      ).toBeUndefined();

      expect(
        validateDecoratedAttribute({ name: 'attr', attribute: attributes.attr, entityName, metadata }),
      ).toBeUndefined();
    });

    test('Should throw an error if decorated attribute is different than this in metadata', async () => {
      expect(() =>
        validateDecoratedAttribute({ name: 'name', attribute: attributes.partitionKey, entityName, metadata }),
      ).toThrowError(/^Attribute ".*" is decorated with a wrong role in "EntityName" Entity.*/);

      expect(() =>
        validateDecoratedAttribute({ name: 'name', attribute: attributes.sortKey, entityName, metadata }),
      ).toThrowError(/^Attribute ".*" is decorated with a wrong role in "EntityName" Entity.*/);

      expect(() =>
        validateDecoratedAttribute({ name: 'name', attribute: attributes.GSI_1_PK, entityName, metadata }),
      ).toThrowError(/^Attribute ".*" is decorated with a wrong role in "EntityName" Entity.*/);

      expect(() =>
        validateDecoratedAttribute({ name: 'name', attribute: attributes.GSI_SK, entityName, metadata }),
      ).toThrowError(/^Attribute ".*" is decorated with a wrong role in "EntityName" Entity.*/);

      expect(() =>
        validateDecoratedAttribute({ name: 'name', attribute: attributes.LSI_1_SK, entityName, metadata }),
      ).toThrowError(/^Attribute ".*" is decorated with a wrong role in "EntityName" Entity.*/);
    });
  });

  describe('validateMetadataUniqueness', async () => {
    test('Should successfully validate that all keys are unique', async () => {
      expect(validateMetadataUniqueness(entityName, metadata)).toBeUndefined();
    });

    test('Should throw an error if decorated attribute is different than this in metadata', async () => {
      expect(() => validateMetadataUniqueness(entityName, metadataInvalid)).toThrowError(
        /^Duplicated metadata keys passed to "EntityName" TableManager.$/,
      );
    });
  });
});
