import { QueryInput } from '@aws-sdk/client-dynamodb';
import { ReturnOption } from '@lib/Entity/types';
import { AttributeMap, UnknownClass } from '@lib/utils';

export interface QueryExecOptions {
  extraInput?: Partial<QueryInput>;
  return?: ReturnOption;
}

export interface QueryExecOutput<T extends UnknownClass> {
  items: Array<InstanceType<T>>;
  count: number;
  lastKey?: AttributeMap;
  scannedCount: number;
}

export interface BuildQueryConditionExpression {
  attributeNames: Record<string, string>;
  attributeValues: AttributeMap;
  conditionExpression: string;
  keyConditionExpression: string;
}
