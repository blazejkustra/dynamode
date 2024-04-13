import { QueryInput } from '@aws-sdk/client-dynamodb';
import Entity from '@lib/entity';
import type { ReturnOption } from '@lib/entity/types';
import { Metadata, TableRetrieverLastKey } from '@lib/table/types';
import { AttributeNames, AttributeValues } from '@lib/utils';

export type QueryRunOptions = {
  extraInput?: Partial<QueryInput>;
  return?: ReturnOption;
  all?: boolean;
  delay?: number;
  max?: number;
};

export type QueryRunOutput<M extends Metadata<E>, E extends typeof Entity> = {
  items: Array<InstanceType<E>>;
  count: number;
  scannedCount: number;
  lastKey?: TableRetrieverLastKey<M, E>;
};

export type BuildQueryConditionExpression = {
  attributeNames: AttributeNames;
  attributeValues: AttributeValues;
  conditionExpression: string;
  keyConditionExpression: string;
};
