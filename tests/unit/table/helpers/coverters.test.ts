import { describe, expect, test } from 'vitest';

import { convertToTableData } from '@lib/table/helpers/converters';
import { ValidationError } from '@lib/utils';

import { validTableDescription } from './fixtures';

describe('Convert To Table Information', () => {
  /* Group of Valid Data */

  test('Should return correct value', () => {
    const tableData = convertToTableData(validTableDescription);
    expect(tableData).toBeDefined();
  });

  test('Should throw ValidationError when TableName is undefined', () => {
    expect(() => convertToTableData({ ...validTableDescription, TableName: undefined })).toThrow(ValidationError);
  });

  test('Should throw ValidationError when TableStatus is undefined', () => {
    expect(() => convertToTableData({ ...validTableDescription, TableStatus: undefined })).toThrow(ValidationError);
  });

  test('Should throw ValidationError when AttributeDefinitions is undefined', () => {
    expect(() => convertToTableData({ ...validTableDescription, AttributeDefinitions: undefined })).toThrow(
      ValidationError,
    );
  });

  test('Should throw ValidationError when KeySchema is undefined', () => {
    expect(() => convertToTableData({ ...validTableDescription, KeySchema: undefined })).toThrow(ValidationError);
  });

  test('Should throw ValidationError when CreationDateTime is undefined', () => {
    expect(() => convertToTableData({ ...validTableDescription, CreationDateTime: undefined })).toThrow(
      ValidationError,
    );
  });

  test('Should throw ValidationError when LocalSecondaryIndexes is not valid.', () => {
    const invalidLSI = {
      ...validTableDescription,
      LocalSecondaryIndexes: [
        {
          IndexName: undefined,
          KeySchema: [{ AttributeName: 'Name', KeyType: 'HASH' }],
          IndexSizeBytes: 1,
          ItemCount: 1,
          IndexArn: 'IndexArn',
        },
      ],
    };
    expect(() => convertToTableData(invalidLSI)).toThrow(ValidationError);
  });

  test('Should throw ValidationError when GlobalSecondaryIndexes is not valid.', () => {
    const invalidGSI = {
      ...validTableDescription,
      GlobalSecondaryIndexes: [
        {
          IndexName: undefined,
          KeySchema: [{ AttributeName: 'Name', KeyType: 'HASH' }],
          IndexSizeBytes: 1,
          ItemCount: 1,
          IndexArn: 'IndexArn',
        },
      ],
    };
    expect(() => convertToTableData(invalidGSI)).toThrow(ValidationError);
  });

  test('Should throw ValidationError when KeySchema of LocalSecondaryIndexes is not valid.', () => {
    const invalidLSIKeySchema = {
      ...validTableDescription,
      LocalSecondaryIndexes: [
        {
          IndexName: 'Name',
          KeySchema: [{ AttributeName: undefined, KeyType: 'HASH' }],
          IndexSizeBytes: 1,
          ItemCount: 1,
          IndexArn: 'IndexArn',
        },
      ],
    };
    expect(() => convertToTableData(invalidLSIKeySchema)).toThrow(ValidationError);
  });

  test('Should throw ValidationError when KeySchema of GlobalSecondaryIndexes is not valid.', () => {
    const invalidGSIKeySchema = {
      ...validTableDescription,
      GlobalSecondaryIndexes: [
        {
          IndexName: 'Name',
          KeySchema: [{ AttributeName: undefined, KeyType: 'HASH' }],
          IndexSizeBytes: 1,
          ItemCount: 1,
          IndexArn: 'IndexArn',
        },
      ],
    };
    expect(() => convertToTableData(invalidGSIKeySchema)).toThrow(ValidationError);
  });

  test('Should throw ValidationError when AttributeDefinitions.AttributeName is undefined', () => {
    const invalidAttrDefAttributeName = {
      ...validTableDescription,
      AttributeDefinitions: [{ AttributeName: undefined, AttributeType: 'String' }],
    };
    expect(() => convertToTableData(invalidAttrDefAttributeName)).toThrow(ValidationError);
  });

  test('Should throw ValidationError when AttributeDefinitions.AttributeType is undefined', () => {
    const invalidAttrDefAttributeType = {
      ...validTableDescription,
      AttributeDefinitions: [{ AttributeName: 'Name', AttributeType: undefined }],
    };
    expect(() => convertToTableData(invalidAttrDefAttributeType)).toThrow(ValidationError);
  });

  test('Should throw ValidationError when KeySchema.AttributeName is undefined', () => {
    const invalidKeySchemaAttributeName = {
      ...validTableDescription,
      KeySchema: [{ AttributeName: undefined, KeyType: 'HASH' }],
    };
    expect(() => convertToTableData(invalidKeySchemaAttributeName)).toThrow(ValidationError);
  });

  test('Should throw ValidationError when KeySchema.KeyType is undefined', () => {
    const invalidKeySchemaKeyType = {
      ...validTableDescription,
      KeySchema: [{ AttributeName: 'Name', KeyType: undefined }],
    };
    expect(() => convertToTableData(invalidKeySchemaKeyType)).toThrow(ValidationError);
  });

  test('Should use default values when LocalSecondaryIndexes.itemCount is undefined', () => {
    const tableNoLSIItemCounts = {
      ...validTableDescription,
      LocalSecondaryIndexes: [
        {
          IndexName: 'IndexName',
          KeySchema: [{ AttributeName: 'AttributeName', KeyType: 'HASH' }],
          IndexSizeBytes: 1,
          ItemCount: undefined,
          IndexArn: 'IndexArn',
        },
      ],
    };
    const result = convertToTableData(tableNoLSIItemCounts);

    expect(result.localSecondaryIndexes[0].itemCount).toBe(0);
  });

  test('Should use default values when GlobalSecondaryIndexes.itemCount is undefined', () => {
    const tableNoGSIItemCounts = {
      ...validTableDescription,
      GlobalSecondaryIndexes: [
        {
          IndexName: 'IndexName',
          KeySchema: [{ AttributeName: 'AttributeName', KeyType: 'HASH' }],
          IndexSizeBytes: 1,
          ItemCount: undefined,
          IndexArn: 'IndexArn',
        },
      ],
    };
    const result = convertToTableData(tableNoGSIItemCounts);

    expect(result.globalSecondaryIndexes[0].itemCount).toBe(0);
  });
});
