import { ReturnValue as DynamoReturnValue } from '@aws-sdk/client-dynamodb';
import { ReturnValues } from '@Entity/types';

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
