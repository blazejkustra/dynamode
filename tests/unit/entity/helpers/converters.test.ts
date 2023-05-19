import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import Dynamode from '@lib/dynamode/index';
import { AttributesMetadata } from '@lib/dynamode/storage/types';
import {
  convertAttributeValuesToEntity,
  convertAttributeValuesToPrimaryKey,
  convertEntityToAttributeValues,
  convertPrimaryKeyToAttributeValues,
} from '@lib/entity/helpers/converters';
import * as prefixSuffixHelpers from '@lib/entity/helpers/prefixSuffix';
import { DefaultError } from '@lib/utils/errors';

import { mockDate, MockEntity, mockInstance, TestTableMetadata } from '../../../fixtures';

const metadata = {
  tableName: 'test-table',
  partitionKey: 'partitionKey',
  sortKey: 'sortKey',
  indexes: {
    GSI_1_NAME: { partitionKey: 'GSI_1_PK', sortKey: 'GSI_1_SK' },
    LSI_1_NAME: { sortKey: 'LSI_1_SK' },
  },
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
} as const;

const mockEntityAttributes = {
  dynamodeEntity: {
    propertyName: 'dynamodeEntity',
    type: String,
  },
  partitionKey: {
    propertyName: 'partitionKey',
    type: String,
  },
  sortKey: {
    propertyName: 'sortKey',
    type: String,
  },
  GSI_1_PK: {
    propertyName: 'GSI_1_PK',
    type: String,
  },
  GSI_1_SK: {
    propertyName: 'GSI_1_SK',
    type: Number,
  },
  LSI_1_SK: {
    propertyName: 'LSI_1_SK',
    type: Number,
  },
  createdAt: {
    propertyName: 'createdAt',
    type: String,
    role: 'date',
  },
  updatedAt: {
    propertyName: 'updatedAt',
    type: Number,
    role: 'date',
  },
  string: {
    propertyName: 'string',
    type: String,
  },
  object: {
    propertyName: 'object',
    type: Object,
  },
  array: {
    propertyName: 'array',
    type: Array,
  },
  map: {
    propertyName: 'map',
    type: Map,
  },
  set: {
    propertyName: 'set',
    type: Set,
  },
  number: {
    propertyName: 'number',
    type: Number,
  },
  boolean: {
    propertyName: 'boolean',
    type: Boolean,
  },
} as any as AttributesMetadata;

const dynamoObject = {
  dynamodeEntity: { S: 'MockEntity' },
  partitionKey: { S: 'PK' },
  sortKey: { S: 'SK' },
  createdAt: { S: mockDate.toISOString() },
  updatedAt: { N: mockDate.getTime().toString() },
  string: { S: 'string' },
  object: { M: { required: { N: '2' } } },
  map: { M: { '1': { S: '2' } } },
  set: { SS: ['1', '2', '3'] },
  array: { L: [{ S: '1' }, { S: '2' }] },
  boolean: { BOOL: true },
};

describe('Converters entity helpers', () => {
  let getEntityAttributesSpy = vi.spyOn(Dynamode.storage, 'getEntityAttributes');
  let getEntityMetadataSpy = vi.spyOn(Dynamode.storage, 'getEntityMetadata');
  let truncateValueSpy = vi.spyOn(prefixSuffixHelpers, 'truncateValue');
  let prefixSuffixValueSpy = vi.spyOn(prefixSuffixHelpers, 'prefixSuffixValue');

  beforeEach(() => {
    getEntityAttributesSpy = vi.spyOn(Dynamode.storage, 'getEntityAttributes');
    getEntityMetadataSpy = vi.spyOn(Dynamode.storage, 'getEntityMetadata');

    truncateValueSpy = vi.spyOn(prefixSuffixHelpers, 'truncateValue');
    truncateValueSpy.mockImplementation((_1, _2, v) => v);

    prefixSuffixValueSpy = vi.spyOn(prefixSuffixHelpers, 'prefixSuffixValue');
    prefixSuffixValueSpy.mockImplementation((_1, _2, v) => v);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('convertAttributeValuesToEntity', async () => {
    test('Should return object in dynamode format', async () => {
      getEntityAttributesSpy.mockReturnValue(mockEntityAttributes);
      getEntityMetadataSpy.mockReturnValue(metadata as any);

      expect(convertAttributeValuesToEntity(MockEntity, dynamoObject)).toEqual(mockInstance);
      expect(truncateValueSpy).toBeCalledTimes(15);
    });

    test('Should return object in dynamode format', async () => {
      getEntityAttributesSpy.mockReturnValue(mockEntityAttributes);
      getEntityMetadataSpy.mockReturnValue(metadata as any);

      expect(convertAttributeValuesToEntity(MockEntity, dynamoObject)).toEqual(mockInstance);
      expect(truncateValueSpy).toBeCalledTimes(15);
    });
  });

  describe('convertEntityToAttributeValues', async () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('Should return object in dynamo format', async () => {
      getEntityAttributesSpy.mockReturnValue(mockEntityAttributes);

      expect(convertEntityToAttributeValues(MockEntity, mockInstance)).toEqual(dynamoObject);
      expect(prefixSuffixValueSpy).toBeCalledTimes(15);
    });

    test('Should throw an error if date has invalid format', async () => {
      getEntityAttributesSpy.mockReturnValue({
        createdAt: {
          propertyName: 'createdAt',
          type: Set,
          role: 'date',
        },
      });

      expect(() => convertEntityToAttributeValues(MockEntity, mockInstance)).toThrow(DefaultError);
    });

    test('Should throw an error if date has invalid role', async () => {
      getEntityAttributesSpy.mockReturnValue({
        createdAt: {
          propertyName: 'createdAt',
          type: String,
          role: 'attribute',
        },
      });

      expect(() => convertEntityToAttributeValues(MockEntity, mockInstance)).toThrow(DefaultError);
    });
  });

  describe('convertAttributeValuesToPrimaryKey', async () => {
    test('Should return composite primary key in dynamode format', async () => {
      getEntityMetadataSpy.mockReturnValue(metadata as any);

      const dynamodePrimaryKey = convertAttributeValuesToPrimaryKey<TestTableMetadata, typeof MockEntity>(MockEntity, {
        partitionKey: {
          S: 'pk_value',
        },
        sortKey: {
          S: 'sk_value',
        },
      });

      expect(dynamodePrimaryKey).toEqual({
        partitionKey: 'pk_value',
        sortKey: 'sk_value',
      });
      expect(truncateValueSpy).toHaveBeenNthCalledWith(1, MockEntity, metadata.partitionKey, 'pk_value');
      expect(truncateValueSpy).toHaveBeenNthCalledWith(2, MockEntity, metadata.sortKey, 'sk_value');
    });

    test('Should return simple primary key in dynamode format', async () => {
      getEntityMetadataSpy.mockReturnValue({ partitionKey: 'partitionKey' } as any);

      const dynamodePrimaryKey = convertAttributeValuesToPrimaryKey<TestTableMetadata, typeof MockEntity>(MockEntity, {
        partitionKey: {
          S: 'pk_value',
        },
      });

      expect(dynamodePrimaryKey).toEqual({
        partitionKey: 'pk_value',
      });
      expect(truncateValueSpy).toBeCalledWith(MockEntity, metadata.partitionKey, 'pk_value');
      expect(truncateValueSpy).toBeCalledTimes(1);
    });
  });

  describe('convertPrimaryKeyToAttributeValues', async () => {
    test('Should return composite primary key in dynamo format', async () => {
      getEntityMetadataSpy.mockReturnValue(metadata as any);

      const dynamoPrimaryKey = convertPrimaryKeyToAttributeValues<TestTableMetadata, typeof MockEntity>(MockEntity, {
        partitionKey: 'pk_value',
        sortKey: 'sk_value',
      });

      expect(dynamoPrimaryKey).toEqual({
        partitionKey: {
          S: 'pk_value',
        },
        sortKey: {
          S: 'sk_value',
        },
      });
      expect(prefixSuffixValueSpy).toHaveBeenNthCalledWith(1, MockEntity, metadata.partitionKey, 'pk_value');
      expect(prefixSuffixValueSpy).toHaveBeenNthCalledWith(2, MockEntity, metadata.sortKey, 'sk_value');
    });

    test('Should return simple primary key in dynamo format', async () => {
      getEntityMetadataSpy.mockReturnValue({ partitionKey: 'partitionKey' } as any);

      const dynamoPrimaryKey = convertPrimaryKeyToAttributeValues(MockEntity, {
        partitionKey: 'pk_value',
      } as any);

      expect(dynamoPrimaryKey).toEqual({
        partitionKey: {
          S: 'pk_value',
        },
      });
      expect(prefixSuffixValueSpy).toBeCalledWith(MockEntity, metadata.partitionKey, 'pk_value');
      expect(prefixSuffixValueSpy).toBeCalledTimes(1);
    });
  });
});
