import { QueryInput } from '@aws-sdk/client-dynamodb';
import type { Entity, ReturnOption } from '@lib/entity/types';
import { AttributeNames, AttributeValues, GenericObject } from '@lib/utils';

export interface QueryRunOptions {
  extraInput?: Partial<QueryInput>;
  return?: ReturnOption;
  all?: boolean;
  delay?: number;
  max?: number;
}

export interface QueryRunOutput<T extends Entity<T>> {
  items: Array<InstanceType<T>>;
  count: number;
  scannedCount: number;
  lastKey?: GenericObject;
}

export interface BuildQueryConditionExpression {
  attributeNames: AttributeNames;
  attributeValues: AttributeValues;
  conditionExpression: string;
  keyConditionExpression: string;
}
