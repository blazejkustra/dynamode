import { Class } from 'type-fest';

import { QueryInput } from '@aws-sdk/client-dynamodb';
import { ReturnOption } from '@lib/Entity/types';
import { AttributeMap } from '@lib/utils';

export interface QueryExecOptions {
  extraInput?: Partial<QueryInput>;
  return?: ReturnOption;
}

export interface QueryExecOutput<T extends Class<unknown>> {
  items: Array<InstanceType<T>>;
  count: number;
}

export interface BuildQueryConditionExpression {
  attributeNames: Record<string, string>;
  attributeValues: AttributeMap;
  conditionExpression: string;
  keyConditionExpression: string;
}
