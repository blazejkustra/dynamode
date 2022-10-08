import { QueryInput } from '@aws-sdk/client-dynamodb';
import { Entity, ReturnOption } from '@lib/Entity/types';
import { AttributeMap, GenericObject } from '@lib/utils';

export interface QueryRunOptions {
  extraInput?: Partial<QueryInput>;
  return?: ReturnOption;
}

export interface QueryRunOutput<T extends Entity<T>> {
  items: Array<InstanceType<T>>;
  count: number;
  scannedCount: number;
  lastKey?: GenericObject;
}

export interface BuildQueryConditionExpression {
  attributeNames: Record<string, string>;
  attributeValues: AttributeMap;
  conditionExpression: string;
  keyConditionExpression: string;
}
