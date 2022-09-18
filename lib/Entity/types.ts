import { Class, RequireAtLeastOne } from 'type-fest';

import { BatchGetItemCommandInput, BatchWriteItemCommandInput, DeleteItemCommandInput, GetItemCommandInput, PutItemCommandInput, UpdateItemCommandInput } from '@aws-sdk/client-dynamodb';
import { Condition } from '@lib/Condition';
import { AttributeMap, Flatten, PickByType } from '@lib/utils';

export type ReturnOption = 'default' | 'input' | 'output';
export type ExcludeFromEntity = Date | Set<unknown>;
export type EntityKeys<T extends Class<unknown>> = Partial<Flatten<InstanceType<T>, ExcludeFromEntity>>;

// Entity.get

export interface EntityGetOptions<T extends Class<unknown>> {
  extraInput?: Partial<GetItemCommandInput>;
  return?: ReturnOption;
  attributes?: Array<keyof EntityKeys<T>>;
  consistent?: boolean;
}

export interface BuildGetProjectionExpression {
  ExpressionAttributeNames?: Record<string, string>;
  ProjectionExpression?: string;
}

// Entity.update

export type UpdateProps<T extends Class<unknown>> = RequireAtLeastOne<{
  add?: PickByType<EntityKeys<T>, number | Set<unknown>>;
  set?: EntityKeys<T>;
  setIfNotExists?: EntityKeys<T>;
  listAppend?: PickByType<EntityKeys<T>, Array<unknown>>;
  increment?: PickByType<EntityKeys<T>, number>;
  decrement?: PickByType<EntityKeys<T>, number>;
  delete?: PickByType<EntityKeys<T>, Set<unknown>>;
  remove?: Array<keyof EntityKeys<T>>;
}>;

export interface EntityUpdateOptions<T extends Class<unknown>> {
  extraInput?: Partial<UpdateItemCommandInput>;
  return?: ReturnOption;
  condition?: Condition<T>;
}

export interface BuildUpdateConditionExpression {
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: AttributeMap;
  UpdateExpression?: string;
}

// Entity.put

export interface EntityPutOptions<T extends Class<unknown>> {
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

// Entity.create

export interface EntityCreateOptions<T extends Class<unknown>> {
  extraInput?: Partial<PutItemCommandInput>;
  return?: ReturnOption;
  condition?: Condition<T>;
}

// Entity.delete

export interface EntityDeleteOptions<T extends Class<unknown>> {
  extraInput?: Partial<DeleteItemCommandInput>;
  return?: ReturnOption;
  condition?: Condition<T>;
}

export interface BuildDeleteConditionExpression {
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: AttributeMap;
  ConditionExpression?: string;
}

// Entity.batchGet

export interface EntityBatchGetOptions<T extends Class<unknown>> {
  extraInput?: Partial<BatchGetItemCommandInput>;
  return?: ReturnOption;
  attributes?: Array<keyof EntityKeys<T>>;
  consistent?: boolean;
}

export interface EntityBatchDeleteOutput<PrimaryKey> {
  unprocessedItems: Array<PrimaryKey>;
}

// Entity.batchGet

export interface EntityBatchGetOutput<T extends Class<unknown>, PrimaryKey> {
  items: Array<InstanceType<T>>;
  unprocessedKeys: Array<PrimaryKey>;
}

// Entity.batchPut

export interface EntityBatchPutOptions {
  extraInput?: Partial<BatchWriteItemCommandInput>;
  return?: ReturnOption;
}

export interface EntityBatchPutOutput<T extends Class<unknown>> {
  items: Array<InstanceType<T>>;
  unprocessedItems: Array<InstanceType<T>>;
}

// Entity.batchDelete

export interface EntityBatchDeleteOptions {
  extraInput?: Partial<BatchWriteItemCommandInput>;
  return?: ReturnOption;
}
