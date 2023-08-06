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
    role: 'gsiPartitionKey',
    indexName: 'GSI_1_NAME',
    prefix: undefined,
    suffix: undefined,
  },
  GSI_1_SK: {
    propertyName: 'GSI_1_SK',
    type: Number,
    role: 'gsiSortKey',
    indexName: 'GSI_1_NAME',
    prefix: undefined,
    suffix: undefined,
  },
  LSI_1_SK: {
    propertyName: 'LSI_1_SK',
    type: Number,
    role: 'lsiSortKey',
    indexName: 'LSI_1_NAME',
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
      sortKey: 'GSI_1_SK',
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
      sortKey: 'GSI_1_SK',
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
          role: 'gsiPartitionKey',
          attributes: { GSI_1_PK: attributes.GSI_1_PK },
          indexName: 'GSI_1_NAME',
          entityName,
        }),
      ).toBeUndefined();
      expect(
        validateMetadataAttribute({
          name: 'GSI_1_SK',
          role: 'gsiSortKey',
          attributes: { GSI_1_SK: attributes.GSI_1_SK },
          indexName: 'GSI_1_NAME',
          entityName,
        }),
      ).toBeUndefined();
      expect(
        validateMetadataAttribute({
          name: 'LSI_1_SK',
          role: 'lsiSortKey',
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
      ).toThrowError(/^Attribute ".*" is decorated with a wrong role in "EntityName" Entity.$/);
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
      ).toThrowError(/^Attribute ".*" is decorated with a wrong index in "EntityName" Entity.$/);
      expect(() =>
        validateMetadataAttribute({
          name: 'GSI_1_SK',
          role: 'gsiSortKey',
          attributes: { GSI_1_SK: attributes.GSI_1_SK },
          indexName: 'indexName',
          entityName,
        }),
      ).toThrowError(/^Attribute ".*" is decorated with a wrong index in "EntityName" Entity.$/);
      expect(() =>
        validateMetadataAttribute({
          name: 'GSI_1_SK',
          role: 'gsiSortKey',
          attributes: { GSI_1_SK: attributes.GSI_1_SK },
          entityName,
        }),
      ).toThrowError(/^Attribute ".*" is decorated with a wrong index in "EntityName" Entity.$/);
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
        validateDecoratedAttribute({ name: 'GSI_1_SK', attribute: attributes.GSI_1_SK, entityName, metadata }),
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
      ).toThrowError(/^Attribute ".*" is decorated with a wrong role in "EntityName" Entity.$/);

      expect(() =>
        validateDecoratedAttribute({ name: 'name', attribute: attributes.sortKey, entityName, metadata }),
      ).toThrowError(/^Attribute ".*" is decorated with a wrong role in "EntityName" Entity.$/);

      expect(() =>
        validateDecoratedAttribute({ name: 'name', attribute: attributes.GSI_1_PK, entityName, metadata }),
      ).toThrowError(/^Attribute ".*" is decorated with a wrong role in "EntityName" Entity.$/);

      expect(() =>
        validateDecoratedAttribute({ name: 'name', attribute: attributes.GSI_1_SK, entityName, metadata }),
      ).toThrowError(/^Attribute ".*" is decorated with a wrong role in "EntityName" Entity.$/);

      expect(() =>
        validateDecoratedAttribute({ name: 'name', attribute: attributes.LSI_1_SK, entityName, metadata }),
      ).toThrowError(/^Attribute ".*" is decorated with a wrong role in "EntityName" Entity.$/);
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
