import { QueryInput } from '@aws-sdk/client-dynamodb';
import { AttributeType } from '@Condition/types';
import { Model } from '@lib/Model';
import { ReturnOption } from '@lib/Model/types';
import { Query } from '@lib/Query';
import { AttributeMap } from '@lib/utils';

type QueryInstance<M extends typeof Model> = InstanceType<typeof Query<M>>;

export interface QueryExecOptions {
  extraInput?: Partial<QueryInput>;
  return?: ReturnOption;
}

export interface QueryExecOutput<M extends typeof Model> {
  items: Array<InstanceType<M>>;
  count: number;
}

export interface KeyQueryCondition<M extends typeof Model> {
  eq: (value: string | number) => QueryInstance<M>;
  ne: (value: string | number) => QueryInstance<M>;
  lt: (value: string | number) => QueryInstance<M>;
  le: (value: string | number) => QueryInstance<M>;
  gt: (value: string | number) => QueryInstance<M>;
  ge: (value: string | number) => QueryInstance<M>;
  beginsWith: (value: string | number) => QueryInstance<M>;
  between: (value1: string | number, value2: string | number) => QueryInstance<M>;
}

export interface FilterQueryCondition<M extends typeof Model> {
  eq: (value: string | number) => QueryInstance<M>;
  ne: (value: string | number) => QueryInstance<M>;
  lt: (value: string | number) => QueryInstance<M>;
  le: (value: string | number) => QueryInstance<M>;
  gt: (value: string | number) => QueryInstance<M>;
  ge: (value: string | number) => QueryInstance<M>;
  exists: () => QueryInstance<M>;
  in: (values: string[]) => QueryInstance<M>;
  type: (value: AttributeType) => QueryInstance<M>;
  contains: (value: string | number) => QueryInstance<M>;
  beginsWith: (value: string | number) => QueryInstance<M>;
  between: (value1: string | number, value2: string | number) => QueryInstance<M>;
  size: () => {
    eq: (value: string | number) => QueryInstance<M>;
    ne: (value: string | number) => QueryInstance<M>;
    lt: (value: string | number) => QueryInstance<M>;
    le: (value: string | number) => QueryInstance<M>;
    gt: (value: string | number) => QueryInstance<M>;
    ge: (value: string | number) => QueryInstance<M>;
  };
  not: () => {
    eq: (value: string | number) => QueryInstance<M>;
    ne: (value: string | number) => QueryInstance<M>;
    lt: (value: string | number) => QueryInstance<M>;
    le: (value: string | number) => QueryInstance<M>;
    gt: (value: string | number) => QueryInstance<M>;
    ge: (value: string | number) => QueryInstance<M>;
    exists: () => QueryInstance<M>;
    in: (values: string[]) => QueryInstance<M>;
    contains: (value: string | number) => QueryInstance<M>;
  };
}

export interface BuildQueryConditionExpression {
  attributeNames: Record<string, string>;
  attributeValues: AttributeMap;
  conditionExpression: string;
  keyConditionExpression: string;
}
