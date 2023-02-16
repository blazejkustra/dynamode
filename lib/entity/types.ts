import { RequireAtLeastOne, ValueOf } from 'type-fest';

import {
  BatchGetItemCommandInput,
  BatchWriteItemCommandInput,
  ConditionCheck,
  Delete,
  DeleteItemCommandInput,
  Get,
  GetItemCommandInput,
  Put,
  PutItemCommandInput,
  Update,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import Condition from '@lib/condition';
import { Entity } from '@lib/entity';
import { AttributeNames, AttributeValues, FlattenObject } from '@lib/utils';

// Return types

export type ReturnOption = 'default' | 'input' | 'output';
export type ReturnValues = 'none' | 'allOld' | 'allNew' | 'updatedOld' | 'updatedNew';
export type ReturnValuesLimited = 'none' | 'allOld';

// Metadata types
type EntityIndexesMetadata = {
  [indexName: string]: {
    partitionKey?: string;
    sortKey?: string;
  };
};

export type EntityMetadata = {
  partitionKey: string;
  sortKey?: string;
  indexes?: EntityIndexesMetadata;
};

type SortKey<EM extends EntityMetadata> = EM['sortKey'];
type PartitionKey<EM extends EntityMetadata> = EM['partitionKey'];
type Indexes<EM extends EntityMetadata> = EM['indexes'];

// Entity types

export type EntityPrimaryKey<EM extends EntityMetadata, E extends typeof Entity> = Pick<
  InstanceType<E>,
  Extract<keyof InstanceType<E>, SortKey<EM> extends string ? PartitionKey<EM> | SortKey<EM> : PartitionKey<EM>>
>;

export type EntityProperties<E extends typeof Entity> = Partial<FlattenObject<InstanceType<E>>>;
export type EntityKey<E extends typeof Entity> = keyof EntityProperties<E>;
export type EntityValue<E extends typeof Entity, K extends EntityKey<E>> = FlattenObject<InstanceType<E>>[K];

export type EntityIndexNames<EM extends EntityMetadata> = keyof Indexes<EM>;
export type EntityPartitionKeys<EM extends EntityMetadata> =
  | PartitionKey<EM>
  | ValueOf<{
      [K in keyof Indexes<EM>]: Indexes<EM> extends EntityIndexesMetadata
        ? Indexes<EM>[K]['partitionKey'] extends string
          ? Indexes<EM>[K]['partitionKey']
          : never
        : never;
    }>;
export type EntitySortKeys<EM extends EntityMetadata> =
  | SortKey<EM>
  | ValueOf<{
      [K in keyof Indexes<EM>]: Indexes<EM> extends EntityIndexesMetadata
        ? Indexes<EM>[K]['sortKey'] extends string
          ? Indexes<EM>[K]['sortKey']
          : never
        : never;
    }>;

// Entity.get

export interface EntityGetOptions<E extends typeof Entity> {
  extraInput?: Partial<GetItemCommandInput>;
  return?: ReturnOption;
  attributes?: Array<EntityKey<E>>;
  consistent?: boolean;
}

export interface BuildGetProjectionExpression {
  attributeNames?: AttributeNames;
  projectionExpression?: string;
}

// Entity.update

export type PickByType<T, Value> = Omit<
  {
    [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P];
  },
  'dynamodeEntity'
> extends infer U
  ? U extends Record<string, never>
    ? Record<string, never>
    : U | Record<string, never>
  : never;

export type UpdateProps<E extends typeof Entity> = RequireAtLeastOne<{
  add?: PickByType<EntityProperties<E>, number | Set<unknown>>;
  set?: EntityProperties<E>;
  setIfNotExists?: EntityProperties<E>;
  listAppend?: PickByType<EntityProperties<E>, Array<unknown>>;
  increment?: PickByType<EntityProperties<E>, number>;
  decrement?: PickByType<EntityProperties<E>, number>;
  delete?: PickByType<EntityProperties<E>, Set<unknown>>;
  remove?: Array<EntityKey<E>>;
}>;

export interface EntityUpdateOptions<E extends typeof Entity> {
  extraInput?: Partial<UpdateItemCommandInput>;
  return?: ReturnOption;
  condition?: Condition<E>;
  returnValues?: ReturnValues;
}

export interface BuildUpdateConditionExpression {
  attributeNames?: AttributeNames;
  attributeValues?: AttributeValues;
  conditionExpression?: string;
  updateExpression: string;
}

// Entity.put

export interface EntityPutOptions<E extends typeof Entity> {
  extraInput?: Partial<PutItemCommandInput>;
  return?: ReturnOption;
  overwrite?: boolean;
  condition?: Condition<E>;
}

export interface BuildPutConditionExpression {
  attributeNames?: AttributeNames;
  attributeValues?: AttributeValues;
  conditionExpression?: string;
}

// Entity.delete

export interface EntityDeleteOptions<E extends typeof Entity> {
  extraInput?: Partial<DeleteItemCommandInput>;
  return?: ReturnOption;
  condition?: Condition<E>;
  throwErrorIfNotExists?: boolean;
  returnValues?: ReturnValuesLimited;
}

export interface BuildDeleteConditionExpression {
  attributeNames?: AttributeNames;
  attributeValues?: AttributeValues;
  conditionExpression?: string;
}

// Entity.batchGet

export interface EntityBatchGetOptions<E extends typeof Entity> {
  extraInput?: Partial<BatchGetItemCommandInput>;
  return?: ReturnOption;
  attributes?: Array<EntityKey<E>>;
  consistent?: boolean;
}

export interface EntityBatchDeleteOutput<PrimaryKey> {
  unprocessedItems: Array<PrimaryKey>;
}

// Entity.batchGet

export interface EntityBatchGetOutput<EM extends EntityMetadata, E extends typeof Entity> {
  items: Array<InstanceType<E>>;
  unprocessedKeys: Array<EntityPrimaryKey<EM, E>>;
}

// Entity.batchPut

export interface EntityBatchPutOptions {
  extraInput?: Partial<BatchWriteItemCommandInput>;
  return?: ReturnOption;
}

export interface EntityBatchPutOutput<E extends typeof Entity> {
  items: Array<InstanceType<E>>;
  unprocessedItems: Array<InstanceType<E>>;
}

// Entity.batchDelete

export interface EntityBatchDeleteOptions {
  extraInput?: Partial<BatchWriteItemCommandInput>;
  return?: ReturnOption;
}

export type EntityTransactionInput<E, Command extends Get | Update | Put | Delete | ConditionCheck> = Command & {
  entity: E;
};

// Entity.transactionGet

export interface EntityTransactionGetOptions<EntityKey> {
  extraInput?: Partial<Get>;
  attributes?: Array<EntityKey>;
}

// Entity.transactionUpdate

export interface EntityTransactionUpdateOptions<E extends typeof Entity> {
  extraInput?: Partial<Update>;
  condition?: Condition<E>;
  returnValuesOnFailure?: ReturnValuesLimited;
}

// Entity.transactionPut

export interface EntityTransactionPutOptions<E extends typeof Entity> {
  extraInput?: Partial<Put>;
  overwrite?: boolean;
  condition?: Condition<E>;
  returnValuesOnFailure?: ReturnValuesLimited;
}

// Entity.transactionDelete

export interface EntityTransactionDeleteOptions<E extends typeof Entity> {
  extraInput?: Partial<Delete>;
  condition?: Condition<E>;
}
