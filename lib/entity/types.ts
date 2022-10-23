import { Class, RequireAtLeastOne, ValueOf } from 'type-fest';

import { BatchGetItemCommandInput, BatchWriteItemCommandInput, ConditionCheck, Delete, DeleteItemCommandInput, DynamoDB, Get, GetItemCommandInput, Put, PutItemCommandInput, Update, UpdateItemCommandInput } from '@aws-sdk/client-dynamodb';
import Condition from '@lib/condition';
import { AttributeMap, Flatten } from '@lib/utils';

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

export type ReturnOption = 'default' | 'input' | 'output';
export type ExcludeFromEntity = Date | Set<unknown> | Map<unknown, unknown>;
export type EntityProperties<T extends Entity<T>> = Partial<Flatten<InstanceType<T>, ExcludeFromEntity>>;
export type EntityKey<T extends Entity<T>> = keyof EntityProperties<T>;
export type EntityValue<T extends Entity<T>, K extends EntityKey<T>> = Flatten<InstanceType<T>, ExcludeFromEntity>[K];

export type Entity<T extends Entity<T>> = Class<unknown> & {
  ddb: DynamoDB;
  tableName: string;
  metadata: EntityMetadata;
  truncateValue: (key: EntityKey<T>, value: unknown) => unknown;
  prefixSuffixValue: (key: EntityKey<T>, value: unknown) => unknown;
  convertAttributeMapToEntity: (item: AttributeMap) => InstanceType<T>;
  convertAttributeMapToPrimaryKey: (item: AttributeMap) => EntityPrimaryKey<T>;
  convertPrimaryKeyToAttributeMap: (primaryKey: EntityPrimaryKey<T>) => AttributeMap;
};

export type EntityPrimaryKey<T extends Entity<T>> = Pick<InstanceType<T>, Extract<keyof InstanceType<T>, T['metadata']['sortKey'] extends string ? T['metadata']['partitionKey'] | T['metadata']['sortKey'] : T['metadata']['partitionKey']>>;
export type EntityIndexNames<T extends Entity<T>> = keyof T['metadata']['indexes'];
export type EntityPartitionKeys<T extends Entity<T>> =
  | T['metadata']['partitionKey']
  | ValueOf<{ [K in keyof T['metadata']['indexes']]: T['metadata']['indexes'] extends EntityIndexesMetadata ? (T['metadata']['indexes'][K]['partitionKey'] extends string ? T['metadata']['indexes'][K]['partitionKey'] : never) : never }>;
export type EntitySortKeys<T extends Entity<T>> =
  | T['metadata']['sortKey']
  | ValueOf<{ [K in keyof T['metadata']['indexes']]: T['metadata']['indexes'] extends EntityIndexesMetadata ? (T['metadata']['indexes'][K]['sortKey'] extends string ? T['metadata']['indexes'][K]['sortKey'] : never) : never }>;

export type ReturnValues = 'none' | 'allOld' | 'allNew' | 'updatedOld' | 'updatedNew';
export type ReturnValuesLimited = 'none' | 'allOld';

// Entity.get

export interface EntityGetOptions<T extends Entity<T>> {
  extraInput?: Partial<GetItemCommandInput>;
  return?: ReturnOption;
  attributes?: Array<EntityKey<T>>;
  consistent?: boolean;
}

export interface BuildGetProjectionExpression {
  ExpressionAttributeNames?: Record<string, string>;
  ProjectionExpression?: string;
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

export type UpdateProps<T extends Entity<T>> = RequireAtLeastOne<{
  add?: PickByType<EntityProperties<T>, number | Set<unknown>>;
  set?: EntityProperties<T>;
  setIfNotExists?: EntityProperties<T>;
  listAppend?: PickByType<EntityProperties<T>, Array<unknown>>;
  increment?: PickByType<EntityProperties<T>, number>;
  decrement?: PickByType<EntityProperties<T>, number>;
  delete?: PickByType<EntityProperties<T>, Set<unknown>>;
  remove?: Array<EntityKey<T>>;
}>;

export interface EntityUpdateOptions<T extends Entity<T>> {
  extraInput?: Partial<UpdateItemCommandInput>;
  return?: ReturnOption;
  condition?: Condition<T>;
  returnValues?: ReturnValues;
}

export interface BuildUpdateConditionExpression {
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: AttributeMap;
  ConditionExpression?: string;
  UpdateExpression: string;
}

// Entity.put

export interface EntityPutOptions<T extends Entity<T>> {
  extraInput?: Partial<PutItemCommandInput>;
  return?: ReturnOption;
  overwrite?: boolean;
  condition?: Condition<T>;
}

export interface BuildPutConditionExpression {
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: AttributeMap;
  ConditionExpression?: string;
}

// Entity.delete

export interface EntityDeleteOptions<T extends Entity<T>> {
  extraInput?: Partial<DeleteItemCommandInput>;
  return?: ReturnOption;
  condition?: Condition<T>;
  throwErrorIfNotExists?: boolean;
  returnValues?: ReturnValuesLimited;
}

export interface BuildDeleteConditionExpression {
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: AttributeMap;
  ConditionExpression?: string;
}

// Entity.batchGet

export interface EntityBatchGetOptions<T extends Entity<T>> {
  extraInput?: Partial<BatchGetItemCommandInput>;
  return?: ReturnOption;
  attributes?: Array<EntityKey<T>>;
  consistent?: boolean;
}

export interface EntityBatchDeleteOutput<PrimaryKey> {
  unprocessedItems: Array<PrimaryKey>;
}

// Entity.batchGet

export interface EntityBatchGetOutput<T extends Entity<T>, PrimaryKey> {
  items: Array<InstanceType<T>>;
  unprocessedKeys: Array<PrimaryKey>;
}

// Entity.batchPut

export interface EntityBatchPutOptions {
  extraInput?: Partial<BatchWriteItemCommandInput>;
  return?: ReturnOption;
}

export interface EntityBatchPutOutput<T extends Entity<T>> {
  items: Array<InstanceType<T>>;
  unprocessedItems: Array<InstanceType<T>>;
}

// Entity.batchDelete

export interface EntityBatchDeleteOptions {
  extraInput?: Partial<BatchWriteItemCommandInput>;
  return?: ReturnOption;
}

export type EntityTransactionInput<T extends Entity<T>, Command extends Get | Update | Put | Delete | ConditionCheck> = Command & { entity: T };

// Entity.transactionGet

export interface EntityTransactionGetOptions<T extends Entity<T>> {
  extraInput?: Partial<Get>;
  attributes?: Array<EntityKey<T>>;
}

// Entity.transactionUpdate

export interface EntityTransactionUpdateOptions<T extends Entity<T>> {
  extraInput?: Partial<Update>;
  condition?: Condition<T>;
  returnValuesOnFailure?: ReturnValuesLimited;
}

// Entity.transactionPut

export interface EntityTransactionPutOptions<T extends Entity<T>> {
  extraInput?: Partial<Put>;
  overwrite?: boolean;
  condition?: Condition<T>;
  returnValuesOnFailure?: ReturnValuesLimited;
}

// Entity.transactionDelete

export interface EntityTransactionDeleteOptions<T extends Entity<T>> {
  extraInput?: Partial<Delete>;
  condition?: Condition<T>;
}
