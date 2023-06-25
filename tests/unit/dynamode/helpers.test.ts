import { describe, expect, test } from 'vitest';

import { validateAttribute } from '@lib/dynamode/storage/helpers';
import { AttributesMetadata } from '@lib/dynamode/storage/types';

const attributes: AttributesMetadata = {
  pk: {
    propertyName: 'pk',
    type: String,
    role: 'partitionKey',
    indexName: undefined,
    prefix: 'prefix',
    suffix: undefined,
  },
  sk: {
    propertyName: 'sk',
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
};

describe('Dynamode helpers', () => {
  describe('validateAttribute', async () => {
    test('Should successfully validate attributes', async () => {
      expect(
        validateAttribute({ name: 'pk', role: 'partitionKey', attributes: { pk: attributes.pk } }),
      ).toBeUndefined();
      expect(validateAttribute({ name: 'sk', role: 'sortKey', attributes: { sk: attributes.sk } })).toBeUndefined();
      expect(
        validateAttribute({
          name: 'GSI_1_PK',
          role: 'gsiPartitionKey',
          attributes: { GSI_1_PK: attributes.GSI_1_PK },
          indexName: 'GSI_1_NAME',
        }),
      ).toBeUndefined();
      expect(
        validateAttribute({
          name: 'GSI_1_SK',
          role: 'gsiSortKey',
          attributes: { GSI_1_SK: attributes.GSI_1_SK },
          indexName: 'GSI_1_NAME',
        }),
      ).toBeUndefined();
      expect(
        validateAttribute({
          name: 'LSI_1_SK',
          role: 'lsiSortKey',
          attributes: { LSI_1_SK: attributes.LSI_1_SK },
          indexName: 'LSI_1_NAME',
        }),
      ).toBeUndefined();
    });

    test("Should throw an error if attribute isn't registered", async () => {
      expect(() => validateAttribute({ name: 'name', role: 'partitionKey', attributes: {} })).toThrowError(
        /^Attribute ".*" isn't registered in the entity.$/,
      );
    });

    test("Should throw an error if attribute roles doesn't match", async () => {
      expect(() => validateAttribute({ name: 'pk', role: 'sortKey', attributes: { pk: attributes.pk } })).toThrowError(
        /^Attribute ".*" is registered with a wrong role.$/,
      );
    });

    test('Should throw an error for indexName mismatch', async () => {
      expect(() =>
        validateAttribute({ name: 'sk', role: 'sortKey', attributes: { sk: attributes.sk }, indexName: 'indexName' }),
      ).toThrowError(/^Attribute ".*" is registered with a wrong index name\/shouldn't be registered with an index.$/);
      expect(() =>
        validateAttribute({
          name: 'GSI_1_SK',
          role: 'gsiSortKey',
          attributes: { GSI_1_SK: attributes.GSI_1_SK },
          indexName: 'indexName',
        }),
      ).toThrowError(/^Attribute ".*" is registered with a wrong index name\/shouldn't be registered with an index.$/);
      expect(() =>
        validateAttribute({
          name: 'GSI_1_SK',
          role: 'gsiSortKey',
          attributes: { GSI_1_SK: attributes.GSI_1_SK },
        }),
      ).toThrowError(/^Attribute ".*" is registered with a wrong index name\/shouldn't be registered with an index.$/);
    });

    test("Should throw an error if attribute roles doesn't match", async () => {
      expect(() =>
        validateAttribute({
          name: 'pk',
          role: 'partitionKey',
          attributes: { pk: { ...attributes.pk, type: Date as any } },
        }),
      ).toThrowError(/^Attribute ".*" is registered with invalid type.$/);
    });
  });
});
