import { describe, expect, test } from 'vitest';

import { AttributesMetadata } from '@lib/dynamode/storage/types';
import { compareDynamodeEntityWithDynamoTable, getAttributeType } from '@lib/table/helpers/utils';
import { ConflictError, ValidationError } from '@lib/utils';

describe('compareDynamodeEntityWithDynamoTable', () => {
  const dynamodeSchema = [
    { AttributeName: 'id', KeyType: 'HASH' },
    { AttributeName: 'timestamp', KeyType: 'RANGE' },
  ];

  test('Should not throw an error if the schemas are identical', () => {
    const identicalSchema = [...dynamodeSchema];
    expect(() => compareDynamodeEntityWithDynamoTable(dynamodeSchema, identicalSchema)).not.toThrow();
    expect(() => compareDynamodeEntityWithDynamoTable(dynamodeSchema, identicalSchema.reverse())).not.toThrow();
  });

  test('Should throw a ConflictError if an attribute is missing in the dynamoDB schema', () => {
    const missingAttributeSchema = [
      { AttributeName: 'id', KeyType: 'HASH' },
      { AttributeName: 'test', KeyType: 'HASH' },
    ];
    expect(() => compareDynamodeEntityWithDynamoTable(dynamodeSchema, missingAttributeSchema)).toThrow(ConflictError);
    expect(() => compareDynamodeEntityWithDynamoTable(dynamodeSchema, missingAttributeSchema)).toThrowError(
      'Key "{"AttributeName":"timestamp","KeyType":"RANGE"}" not found in table',
    );
  });

  test('Should throw a ConflictError if an attribute is missing in the dynamode schema', () => {
    expect(() =>
      compareDynamodeEntityWithDynamoTable(
        [...dynamodeSchema, { AttributeName: 'id', KeyType: 'HASH' }],
        [...dynamodeSchema, { AttributeName: 'name', KeyType: 'RANGE' }],
      ),
    ).toThrow(ConflictError);
    expect(() =>
      compareDynamodeEntityWithDynamoTable(
        [...dynamodeSchema, { AttributeName: 'id', KeyType: 'HASH' }],
        [...dynamodeSchema, { AttributeName: 'name', KeyType: 'RANGE' }],
      ),
    ).toThrowError('Key "{"AttributeName":"name","KeyType":"RANGE"}" not found in entity');
  });
});

describe('getAttributeType', () => {
  const mockAttributesMetadata: AttributesMetadata = {
    name: {
      propertyName: 'Name',
      type: String,
      role: 'attribute',
    },
    age: {
      propertyName: 'Age',
      type: Number,
      role: 'attribute',
    },
    invalidProp: {
      propertyName: 'InvalidProp',
      type: Boolean,
      role: 'attribute',
    },
  };

  test('Should return "S" for String type attribute', () => {
    const attributeType = getAttributeType(mockAttributesMetadata, 'name');
    expect(attributeType).toEqual('S');
  });

  test('Should return "N" for Number type attribute', () => {
    const attributeType = getAttributeType(mockAttributesMetadata, 'age');
    expect(attributeType).toEqual('N');
  });

  test('Should throw ValidationError for invalid attribute type', () => {
    expect(() => getAttributeType(mockAttributesMetadata, 'invalidProp')).toThrow(ValidationError);
  });
});
