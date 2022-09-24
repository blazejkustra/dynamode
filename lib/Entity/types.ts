import { RequireAtLeastOne } from 'type-fest';

import { BatchGetItemCommandInput, BatchWriteItemCommandInput, DeleteItemCommandInput, GetItemCommandInput, PutItemCommandInput, UpdateItemCommandInput } from '@aws-sdk/client-dynamodb';
import { Condition } from '@lib/Condition';
import { AttributeMap, Flatten, PickByType, UnknownClass } from '@lib/utils';

export type ReturnOption = 'default' | 'input' | 'output';
export type ExcludeFromEntity = Date | Set<unknown> | Map<unknown, unknown>;
export type EntityProperties<T extends UnknownClass> = Partial<Flatten<InstanceType<T>, ExcludeFromEntity>>;
export type EntityKeys<T extends UnknownClass> = keyof EntityProperties<T>;

// Entity.get

export interface EntityGetOptions<T extends UnknownClass> {
  extraInput?: Partial<GetItemCommandInput>;
  return?: ReturnOption;
  attributes?: Array<EntityKeys<T>>;
  consistent?: boolean;
}

export interface BuildGetProjectionExpression {
  ExpressionAttributeNames?: Record<string, string>;
  ProjectionExpression?: string;
}

// Entity.update

export type UpdateProps<T extends UnknownClass> = RequireAtLeastOne<{
  add?: PickByType<EntityProperties<T>, number | Set<unknown>>;
  set?: EntityProperties<T>;
  setIfNotExists?: EntityProperties<T>;
  listAppend?: PickByType<EntityProperties<T>, Array<unknown>>;
  increment?: PickByType<EntityProperties<T>, number>;
  decrement?: PickByType<EntityProperties<T>, number>;
  delete?: PickByType<EntityProperties<T>, Set<unknown>>;
  remove?: Array<EntityKeys<T>>;
}>;

export interface EntityUpdateOptions<T extends UnknownClass> {
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

export interface EntityPutOptions<T extends UnknownClass> {
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

export interface EntityCreateOptions<T extends UnknownClass> {
  extraInput?: Partial<PutItemCommandInput>;
  return?: ReturnOption;
  condition?: Condition<T>;
}

// Entity.delete

export interface EntityDeleteOptions<T extends UnknownClass> {
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

export interface EntityBatchGetOptions<T extends UnknownClass> {
  extraInput?: Partial<BatchGetItemCommandInput>;
  return?: ReturnOption;
  attributes?: Array<EntityKeys<T>>;
  consistent?: boolean;
}

export interface EntityBatchDeleteOutput<PrimaryKey> {
  unprocessedItems: Array<PrimaryKey>;
}

// Entity.batchGet

export interface EntityBatchGetOutput<T extends UnknownClass, PrimaryKey> {
  items: Array<InstanceType<T>>;
  unprocessedKeys: Array<PrimaryKey>;
}

// Entity.batchPut

export interface EntityBatchPutOptions {
  extraInput?: Partial<BatchWriteItemCommandInput>;
  return?: ReturnOption;
}

export interface EntityBatchPutOutput<T extends UnknownClass> {
  items: Array<InstanceType<T>>;
  unprocessedItems: Array<InstanceType<T>>;
}

// Entity.batchDelete

export interface EntityBatchDeleteOptions {
  extraInput?: Partial<BatchWriteItemCommandInput>;
  return?: ReturnOption;
}
