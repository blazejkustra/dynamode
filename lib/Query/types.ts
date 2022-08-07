import { AttributeType } from '@Condition/types';
import { Query } from '@lib/Query';

type QueryInstance = InstanceType<typeof Query>;

export interface KeyQueryCondition {
  eq: (value: string | number) => QueryInstance;
  ne: (value: string | number) => QueryInstance;
  lt: (value: string | number) => QueryInstance;
  le: (value: string | number) => QueryInstance;
  gt: (value: string | number) => QueryInstance;
  ge: (value: string | number) => QueryInstance;
  beginsWith: (value: string | number) => QueryInstance;
  between: (value1: string | number, value2: string | number) => QueryInstance;
}

export interface FilterQueryCondition {
  eq: (value: string | number) => QueryInstance;
  ne: (value: string | number) => QueryInstance;
  lt: (value: string | number) => QueryInstance;
  le: (value: string | number) => QueryInstance;
  gt: (value: string | number) => QueryInstance;
  ge: (value: string | number) => QueryInstance;
  exists: () => QueryInstance;
  in: (values: string[]) => QueryInstance;
  type: (value: AttributeType) => QueryInstance;
  contains: (value: string | number) => QueryInstance;
  beginsWith: (value: string | number) => QueryInstance;
  between: (value1: string | number, value2: string | number) => QueryInstance;
  size: () => {
    eq: (value: string | number) => QueryInstance;
    ne: (value: string | number) => QueryInstance;
    lt: (value: string | number) => QueryInstance;
    le: (value: string | number) => QueryInstance;
    gt: (value: string | number) => QueryInstance;
    ge: (value: string | number) => QueryInstance;
  };
  not: () => {
    eq: (value: string | number) => QueryInstance;
    ne: (value: string | number) => QueryInstance;
    lt: (value: string | number) => QueryInstance;
    le: (value: string | number) => QueryInstance;
    gt: (value: string | number) => QueryInstance;
    ge: (value: string | number) => QueryInstance;
    exists: () => QueryInstance;
    in: (values: string[]) => QueryInstance;
    contains: (value: string | number) => QueryInstance;
  };
}
