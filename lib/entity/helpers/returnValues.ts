import {
  ReturnValue as DynamoReturnValue,
  ReturnValuesOnConditionCheckFailure as DynamoReturnValueOnFailure,
} from '@aws-sdk/client-dynamodb';
import { ReturnValues, ReturnValuesLimited } from '@lib/entity/types';

export function mapReturnValues(returnValues?: ReturnValues): DynamoReturnValue {
  if (!returnValues) {
    return DynamoReturnValue.ALL_NEW;
  }

  return (
    {
      none: DynamoReturnValue.NONE,
      allOld: DynamoReturnValue.ALL_OLD,
      allNew: DynamoReturnValue.ALL_NEW,
      updatedOld: DynamoReturnValue.UPDATED_OLD,
      updatedNew: DynamoReturnValue.UPDATED_NEW,
    } as const
  )[returnValues];
}

export function mapReturnValuesLimited(returnValues?: ReturnValuesLimited): DynamoReturnValueOnFailure {
  if (!returnValues) {
    return DynamoReturnValueOnFailure.ALL_OLD;
  }

  return (
    {
      none: DynamoReturnValueOnFailure.NONE,
      allOld: DynamoReturnValueOnFailure.ALL_OLD,
    } as const
  )[returnValues];
}
