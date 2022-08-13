import { Condition } from '@lib/Condition';

export enum AttributeType {
  String = 'S',
  StringSet = 'SS',
  Number = 'N',
  NumberSet = 'NS',
  Binary = 'B',
  BinarySet = 'BS',
  Boolean = 'BOOL',
  Null = 'NULL',
  List = 'L',
  Map = 'M',
}

type ConditionInstance = InstanceType<typeof Condition>;
export interface SizeFunction {
  eq: (value: string | number) => ConditionInstance;
  ne: (value: string | number) => ConditionInstance;
  lt: (value: string | number) => ConditionInstance;
  le: (value: string | number) => ConditionInstance;
  gt: (value: string | number) => ConditionInstance;
  ge: (value: string | number) => ConditionInstance;
}

export interface NegateFunction {
  eq: (value: string | number) => ConditionInstance;
  ne: (value: string | number) => ConditionInstance;
  lt: (value: string | number) => ConditionInstance;
  le: (value: string | number) => ConditionInstance;
  gt: (value: string | number) => ConditionInstance;
  ge: (value: string | number) => ConditionInstance;
  exists: () => ConditionInstance;
  in: (values: string[]) => ConditionInstance;
  contains: (value: string | number) => ConditionInstance;
}
