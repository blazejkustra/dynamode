import { describe, expect, test } from 'vitest';

import {
  ReturnValue as DynamoReturnValue,
  ReturnValuesOnConditionCheckFailure as DynamoReturnValueOnFailure,
} from '@aws-sdk/client-dynamodb';
import { mapReturnValues, mapReturnValuesLimited } from '@lib/entity/helpers/returnValues';

describe('returnValues', () => {
  describe('mapReturnValues', async () => {
    test('Should properly map all DynamoReturnValues', async () => {
      expect(mapReturnValues('none')).toEqual(DynamoReturnValue.NONE);
      expect(mapReturnValues('allOld')).toEqual(DynamoReturnValue.ALL_OLD);
      expect(mapReturnValues('allNew')).toEqual(DynamoReturnValue.ALL_NEW);
      expect(mapReturnValues('updatedOld')).toEqual(DynamoReturnValue.UPDATED_OLD);
      expect(mapReturnValues('updatedNew')).toEqual(DynamoReturnValue.UPDATED_NEW);
    });

    test('Should properly return default return value', async () => {
      expect(mapReturnValues()).toEqual(DynamoReturnValue.ALL_NEW);
    });
  });

  describe('mapReturnValuesLimited', async () => {
    test('Should properly map all DynamoReturnValueOnFailure', async () => {
      expect(mapReturnValuesLimited('none')).toEqual(DynamoReturnValueOnFailure.NONE);
      expect(mapReturnValuesLimited('allOld')).toEqual(DynamoReturnValueOnFailure.ALL_OLD);
    });

    test('Should properly return default return value', async () => {
      expect(mapReturnValuesLimited()).toEqual(DynamoReturnValueOnFailure.ALL_OLD);
    });
  });
});
