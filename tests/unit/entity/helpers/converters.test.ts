import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import Dynamode from '@lib/dynamode/index';
import { AttributesMetadata } from '@lib/dynamode/storage/types';
import {
  convertAttributeValuesToEntity,
  convertAttributeValuesToLastKey,
  convertEntityToAttributeValues,
  convertPrimaryKeyToAttributeValues,
  convertRetrieverLastKeyToAttributeValues,
} from '@lib/entity/helpers/converters';
import * as transformValuesHelpers from '@lib/entity/helpers/transformValues';

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
  binary: {
    propertyName: 'binary',
    type: Uint8Array,
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
  binary: { B: new Uint8Array([1, 2, 3]) },
};

describe('Converters entity helpers', () => {
  let getEntityAttributesSpy = vi.spyOn(Dynamode.storage, 'getEntityAttributes');
  let getEntityMetadataSpy = vi.spyOn(Dynamode.storage, 'getEntityMetadata');
  let truncateValueSpy = vi.spyOn(transformValuesHelpers, 'truncateValue');
  let transformValueSpy = vi.spyOn(transformValuesHelpers, 'transformValue');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
    getEntityAttributesSpy = vi.spyOn(Dynamode.storage, 'getEntityAttributes');
    getEntityMetadataSpy = vi.spyOn(Dynamode.storage, 'getEntityMetadata');

    truncateValueSpy = vi.spyOn(transformValuesHelpers, 'truncateValue');
    truncateValueSpy.mockImplementation((_1, _2, v) => v);

    transformValueSpy = vi.spyOn(transformValuesHelpers, 'transformValue');
    transformValueSpy.mockImplementation((_1, k, v) =>
      v instanceof Date ? (k === 'updatedAt' ? v.getTime() : v.toISOString()) : v,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('convertAttributeValuesToEntity', async () => {
    test('Should return object in dynamode format', async () => {
      getEntityAttributesSpy.mockReturnValue(mockEntityAttributes);
      getEntityMetadataSpy.mockReturnValue(metadata as any);

      expect(convertAttributeValuesToEntity(MockEntity, dynamoObject)).toEqual(mockInstance);
      expect(truncateValueSpy).toBeCalledTimes(16);
    });

    test('Should return object in dynamode format', async () => {
      getEntityAttributesSpy.mockReturnValue(mockEntityAttributes);
      getEntityMetadataSpy.mockReturnValue(metadata as any);

      expect(convertAttributeValuesToEntity(MockEntity, dynamoObject)).toEqual(mockInstance);
      expect(truncateValueSpy).toBeCalledTimes(16);
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
      expect(transformValueSpy).toBeCalledTimes(16);
    });
  });

  describe('convertAttributeValuesToLastKey', async () => {
    test('Should return composite primary key in dynamode format', async () => {
      getEntityMetadataSpy.mockReturnValue(metadata as any);

      const dynamodePrimaryKey = convertAttributeValuesToLastKey<TestTableMetadata, typeof MockEntity>(MockEntity, {
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

      const dynamodePrimaryKey = convertAttributeValuesToLastKey<TestTableMetadata, typeof MockEntity>(MockEntity, {
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
      expect(transformValueSpy).toHaveBeenNthCalledWith(1, MockEntity, metadata.partitionKey, 'pk_value');
      expect(transformValueSpy).toHaveBeenNthCalledWith(2, MockEntity, metadata.sortKey, 'sk_value');
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
      expect(transformValueSpy).toBeCalledWith(MockEntity, metadata.partitionKey, 'pk_value');
      expect(transformValueSpy).toBeCalledTimes(1);
    });
  });

  describe('convertRetrieverLastKeyToAttributeValues', async () => {
    test('Should return composite last key in dynamo format', async () => {
      getEntityMetadataSpy.mockReturnValue({ ...metadata, indexes: undefined } as any);

      const dynamoPrimaryKey = convertRetrieverLastKeyToAttributeValues<TestTableMetadata, typeof MockEntity>(
        MockEntity,
        {
          partitionKey: 'pk_value',
          sortKey: 'sk_value',
        },
      );

      expect(dynamoPrimaryKey).toEqual({
        partitionKey: {
          S: 'pk_value',
        },
        sortKey: {
          S: 'sk_value',
        },
      });
      expect(transformValueSpy).toHaveBeenNthCalledWith(1, MockEntity, metadata.partitionKey, 'pk_value');
      expect(transformValueSpy).toHaveBeenNthCalledWith(2, MockEntity, metadata.sortKey, 'sk_value');
    });

    test('Should return simple last key in dynamo format', async () => {
      getEntityMetadataSpy.mockReturnValue({ partitionKey: 'partitionKey' } as any);

      const dynamoPrimaryKey = convertRetrieverLastKeyToAttributeValues(MockEntity, {
        partitionKey: 'pk_value',
      } as any);

      expect(dynamoPrimaryKey).toEqual({
        partitionKey: {
          S: 'pk_value',
        },
      });
      expect(transformValueSpy).toBeCalledWith(MockEntity, metadata.partitionKey, 'pk_value');
      expect(transformValueSpy).toBeCalledTimes(1);
    });

    test('Should return composite (+ indexes) last key in dynamo format', async () => {
      getEntityMetadataSpy.mockReturnValue(metadata as any);

      const dynamoPrimaryKey = convertRetrieverLastKeyToAttributeValues<TestTableMetadata, typeof MockEntity>(
        MockEntity,
        {
          partitionKey: 'pk_value',
          sortKey: 'sk_value',
          GSI_1_PK: 'gsi_1_pk_value',
          GSI_1_SK: 111,
          LSI_1_SK: 222,
        },
      );

      expect(dynamoPrimaryKey).toEqual({
        partitionKey: {
          S: 'pk_value',
        },
        sortKey: {
          S: 'sk_value',
        },
        GSI_1_PK: {
          S: 'gsi_1_pk_value',
        },
        GSI_1_SK: {
          N: '111',
        },
        LSI_1_SK: {
          N: '222',
        },
      });
      expect(transformValueSpy).toHaveBeenNthCalledWith(
        1,
        MockEntity,
        metadata.indexes.GSI_1_NAME.partitionKey,
        'gsi_1_pk_value',
      );
      expect(transformValueSpy).toHaveBeenNthCalledWith(2, MockEntity, metadata.indexes.GSI_1_NAME.sortKey, 111);
      expect(transformValueSpy).toHaveBeenNthCalledWith(3, MockEntity, metadata.indexes.LSI_1_NAME.sortKey, 222);
      expect(transformValueSpy).toHaveBeenNthCalledWith(4, MockEntity, metadata.partitionKey, 'pk_value');
      expect(transformValueSpy).toHaveBeenNthCalledWith(5, MockEntity, metadata.sortKey, 'sk_value');
    });
  });
});
