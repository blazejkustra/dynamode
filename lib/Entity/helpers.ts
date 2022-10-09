import { ReturnValue as DynamoReturnValue, ReturnValuesOnConditionCheckFailure as DynamoReturnValueOnFailure } from '@aws-sdk/client-dynamodb';
import { ReturnValues, ReturnValuesOnFailure } from '@Entity/types';

export function mapReturnValues(returnValues?: ReturnValues): DynamoReturnValue {
  if (!returnValues) {
    return 'ALL_NEW';
  }

  return (
    {
      none: 'NONE',
      allOld: 'ALL_OLD',
      allNew: 'ALL_NEW',
      updatedOld: 'UPDATED_OLD',
      updatedNew: 'UPDATED_NEW',
    } as const
  )[returnValues];
}

export function mapReturnValuesOnFailure(returnValues?: ReturnValuesOnFailure): DynamoReturnValueOnFailure {
  if (!returnValues) {
    return 'ALL_OLD';
  }

  return (
    {
      none: 'NONE',
      allOld: 'ALL_OLD',
    } as const
  )[returnValues];
}
