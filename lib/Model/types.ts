import { RequireAtLeastOne } from 'type-fest';

import { BatchGetItemCommandInput, BatchWriteItemCommandInput, DeleteItemCommandInput, GetItemCommandInput, PutItemCommandInput, UpdateItemCommandInput } from '@aws-sdk/client-dynamodb';
import { ConditionInstance } from '@lib/Condition';
import { Model } from '@lib/Model';
import { Table } from '@lib/Table';
import { gsi1PartitionKey, gsi1SortKey, gsi2PartitionKey, gsi2SortKey, lsi1SortKey, lsi2SortKey, partitionKey, sortKey } from '@lib/utils/symbols';
import { Flatten, PickByType } from '@lib/utils/types';

export type PrimaryKey = { [partitionKey]: string | number; [sortKey]: string | number };
export interface ModelProps<T extends Table> {
  [partitionKey]: string;
  [sortKey]: string;

  [gsi1PartitionKey]?: string;
  [gsi1SortKey]?: string;

  [gsi2PartitionKey]?: string;
  [gsi2SortKey]?: string;

  [lsi1SortKey]?: string;
  [lsi2SortKey]?: string;

  createdAt?: string | number;
}

export type ReturnOption = 'default' | 'input' | 'output';

type ExcludeFromModel = Date | Set<unknown> | symbol;
export type ModelKeys<M extends Model> = Omit<Partial<Flatten<M, ExcludeFromModel>>, symbol>;

export interface ModelGetOptions<M extends typeof Model> {
  extraInput?: Partial<GetItemCommandInput>;
  return?: ReturnOption;
  attributes?: Array<keyof ModelKeys<InstanceType<M>>>;
  consistent?: boolean;
}

export interface ModelPutOptions<M extends typeof Model> {
  extraInput?: Partial<PutItemCommandInput>;
  return?: ReturnOption;
  overwrite?: boolean;
  condition?: ConditionInstance<M>;
}

export interface ModelCreateOptions<M extends typeof Model> {
  extraInput?: Partial<PutItemCommandInput>;
  return?: ReturnOption;
  condition?: ConditionInstance<M>;
}

export interface ModelUpdateOptions<M extends typeof Model> {
  extraInput?: Partial<UpdateItemCommandInput>;
  return?: ReturnOption;
  condition?: ConditionInstance<M>;
}

export interface ModelDeleteOptions<M extends typeof Model> {
  extraInput?: Partial<DeleteItemCommandInput>;
  return?: ReturnOption;
  condition?: ConditionInstance<M>;
}

export interface ModelBatchGetOptions<M extends typeof Model> {
  extraInput?: Partial<BatchGetItemCommandInput>;
  return?: ReturnOption;
  attributes?: Array<keyof ModelKeys<InstanceType<M>>>;
  consistent?: boolean;
}

export interface ModelBatchDeleteOutput {
  unprocessedItems: Array<PrimaryKey>;
}

export interface ModelBatchPutOptions {
  extraInput?: Partial<BatchWriteItemCommandInput>;
  return?: ReturnOption;
}

export interface ModelBatchPutOutput<M extends typeof Model> {
  items: Array<InstanceType<M>>;
  unprocessedItems: Array<InstanceType<M>>;
}

export interface ModelBatchDeleteOptions {
  extraInput?: Partial<BatchWriteItemCommandInput>;
  return?: ReturnOption;
}

export interface ModelBatchGetOutput<M extends typeof Model> {
  items: Array<InstanceType<M>>;
  unprocessedKeys: Array<PrimaryKey>;
}

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
