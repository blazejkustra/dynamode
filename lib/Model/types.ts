import { RequireAtLeastOne } from 'type-fest';

import { BatchGetItemCommandInput, BatchWriteItemCommandInput, DeleteItemCommandInput, GetItemCommandInput, PutItemCommandInput, UpdateItemCommandInput } from '@aws-sdk/client-dynamodb';
import { ConditionInstance } from '@lib/Condition';
import { Model } from '@lib/Model';
import { Table } from '@lib/Table';
import {
  createdAt,
  gsi1PartitionKey,
  gsi1SortKey,
  gsi2PartitionKey,
  gsi2SortKey,
  gsi3PartitionKey,
  gsi3SortKey,
  gsi4PartitionKey,
  gsi4SortKey,
  gsi5PartitionKey,
  gsi5SortKey,
  gsi6PartitionKey,
  gsi6SortKey,
  gsi7PartitionKey,
  gsi7SortKey,
  gsi8PartitionKey,
  gsi8SortKey,
  gsi9PartitionKey,
  gsi9SortKey,
  gsi10PartitionKey,
  gsi10SortKey,
  lsi1SortKey,
  lsi2SortKey,
  lsi3SortKey,
  lsi4SortKey,
  lsi5SortKey,
  partitionKey,
  sortKey,
  updatedAt,
} from '@lib/utils/symbols';
import { AttributeMap, Flatten, PickByType } from '@lib/utils/types';

export type PrimaryKey<M extends typeof Model> = { [partitionKey]: InstanceType<M>[typeof partitionKey]; [sortKey]: InstanceType<M>[typeof sortKey] };
export type ModelProps<T extends typeof Table> = {
  [createdAt]?: Date;
  [updatedAt]?: Date;

  [partitionKey]: T['partitionKeyType'];
  [sortKey]?: T['sortKeyType'];

  [gsi1PartitionKey]?: T['gsi1PartitionKeyType'];
  [gsi1SortKey]?: T['gsi1SortKeyType'];

  [gsi2PartitionKey]?: T['gsi2PartitionKeyType'];
  [gsi2SortKey]?: T['gsi2SortKeyType'];

  [gsi3PartitionKey]?: T['gsi3PartitionKeyType'];
  [gsi3SortKey]?: T['gsi3SortKeyType'];

  [gsi4PartitionKey]?: T['gsi4PartitionKeyType'];
  [gsi4SortKey]?: T['gsi4SortKeyType'];

  [gsi5PartitionKey]?: T['gsi5PartitionKeyType'];
  [gsi5SortKey]?: T['gsi5SortKeyType'];

  [gsi6PartitionKey]?: T['gsi6PartitionKeyType'];
  [gsi6SortKey]?: T['gsi6SortKeyType'];

  [gsi7PartitionKey]?: T['gsi7PartitionKeyType'];
  [gsi7SortKey]?: T['gsi7SortKeyType'];

  [gsi8PartitionKey]?: T['gsi8PartitionKeyType'];
  [gsi8SortKey]?: T['gsi8SortKeyType'];

  [gsi9PartitionKey]?: T['gsi9PartitionKeyType'];
  [gsi9SortKey]?: T['gsi9SortKeyType'];

  [gsi10PartitionKey]?: T['gsi10PartitionKeyType'];
  [gsi10SortKey]?: T['gsi10SortKeyType'];

  [lsi1SortKey]?: T['lsi1Type'];
  [lsi2SortKey]?: T['lsi2Type'];
  [lsi3SortKey]?: T['lsi3Type'];
  [lsi4SortKey]?: T['lsi4Type'];
  [lsi5SortKey]?: T['lsi5Type'];
};

export type ReturnOption = 'default' | 'input' | 'output';
export type ExcludeFromModel = Date | Set<unknown> | symbol;
export type ModelKeys<M extends Model> = Partial<Flatten<M, ExcludeFromModel>>;

// Model.get

export interface ModelGetOptions<M extends typeof Model> {
  extraInput?: Partial<GetItemCommandInput>;
  return?: ReturnOption;
  attributes?: Array<keyof ModelKeys<InstanceType<M>>>;
  consistent?: boolean;
}
export interface BuildGetProjectionExpression {
  ExpressionAttributeNames?: Record<string, string>;
  ProjectionExpression?: string;
}

// Model.update

export type UpdateProps<M extends Model> = RequireAtLeastOne<{
  add?: PickByType<ModelKeys<M>, number | Set<unknown>>;
  set?: ModelKeys<M>;
  setIfNotExists?: ModelKeys<M>;
  listAppend?: PickByType<ModelKeys<M>, Array<unknown>>;
  increment?: PickByType<ModelKeys<M>, number>;
  decrement?: PickByType<ModelKeys<M>, number>;
  delete?: PickByType<ModelKeys<M>, Set<unknown>>;
  remove?: Array<keyof ModelKeys<M>>;
}>;

export interface ModelUpdateOptions<M extends typeof Model> {
  extraInput?: Partial<UpdateItemCommandInput>;
  return?: ReturnOption;
  condition?: ConditionInstance<M>;
}

export interface BuildUpdateConditionExpression {
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: AttributeMap;
  UpdateExpression?: string;
}

// Model.put

export interface ModelPutOptions<M extends typeof Model> {
  extraInput?: Partial<PutItemCommandInput>;
  return?: ReturnOption;
  overwrite?: boolean;
  condition?: ConditionInstance<M>;
}
export interface BuildPutConditionExpression {
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: AttributeMap;
  ConditionExpression?: string;
}

// Model.create

export interface ModelCreateOptions<M extends typeof Model> {
  extraInput?: Partial<PutItemCommandInput>;
  return?: ReturnOption;
  condition?: ConditionInstance<M>;
}

// Model.delete

export interface ModelDeleteOptions<M extends typeof Model> {
  extraInput?: Partial<DeleteItemCommandInput>;
  return?: ReturnOption;
  condition?: ConditionInstance<M>;
}

export interface BuildDeleteConditionExpression {
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: AttributeMap;
  ConditionExpression?: string;
}

// Model.batchGet

export interface ModelBatchGetOptions<M extends typeof Model> {
  extraInput?: Partial<BatchGetItemCommandInput>;
  return?: ReturnOption;
  attributes?: Array<keyof ModelKeys<InstanceType<M>>>;
  consistent?: boolean;
}

export interface ModelBatchDeleteOutput<M extends typeof Model> {
  unprocessedItems: Array<PrimaryKey<M>>;
}

// Model.batchGet

export interface ModelBatchGetOutput<M extends typeof Model> {
  items: Array<InstanceType<M>>;
  unprocessedKeys: Array<PrimaryKey<M>>;
}

// Model.batchPut

export interface ModelBatchPutOptions {
  extraInput?: Partial<BatchWriteItemCommandInput>;
  return?: ReturnOption;
}

export interface ModelBatchPutOutput<M extends typeof Model> {
  items: Array<InstanceType<M>>;
  unprocessedItems: Array<InstanceType<M>>;
}

// Model.batchDelete

export interface ModelBatchDeleteOptions {
  extraInput?: Partial<BatchWriteItemCommandInput>;
  return?: ReturnOption;
}
