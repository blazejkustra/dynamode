import { TableDescription } from '@aws-sdk/client-dynamodb';
import { TableInformation } from '@lib/table/types';
import { ValidationError } from '@lib/utils';

export function convertTableDescription(tableDescription?: TableDescription): TableInformation {
  if (!tableDescription) {
    throw new ValidationError('TableDescription is required');
  }

  return tableDescription;
}
