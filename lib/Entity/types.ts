import { Class, RequireAtLeastOne } from 'type-fest';

import { BatchGetItemCommandInput, BatchWriteItemCommandInput, DeleteItemCommandInput, DynamoDB, GetItemCommandInput, PutItemCommandInput, UpdateItemCommandInput } from '@aws-sdk/client-dynamodb';
import { Condition } from '@lib/Condition';
import { AttributeMap, Flatten, PickByType } from '@lib/utils';

export type ReturnOption = 'default' | 'input' | 'output';
export type ExcludeFromEntity = Date | Set<unknown> | Map<unknown, unknown>;
export type EntityProperties<T extends EntityClass<T>> = Partial<Flatten<InstanceType<T>, ExcludeFromEntity>>;
export type EntityKey<T extends EntityClass<T>> = keyof EntityProperties<T>;
export type EntityValue<T extends EntityClass<T>, K extends EntityKey<T>> = EntityProperties<T>[K];

export type EntityClass<T extends EntityClass<T>> = Class<unknown> & {
  ddb: DynamoDB;
  tableName: string;
  PrimaryKey: string;
  truncateValue: (key: EntityKey<T>, value: unknown) => unknown;
  prefixSuffixValue: (key: EntityKey<T>, value: unknown) => unknown;
  convertEntityFromDynamo: (item: AttributeMap) => InstanceType<T>;
  convertPrimaryKeyFromDynamo: (item: AttributeMap) => EntityPrimaryKey<T>;
  convertPrimaryKeyToDynamo: (primaryKey: EntityPrimaryKey<T>) => AttributeMap;
};

export type EntityPrimaryKey<T extends EntityClass<T>> = Pick<InstanceType<T>, Extract<keyof InstanceType<T>, T['PrimaryKey']>>;

// Entity.get

export interface EntityGetOptions<T extends EntityClass<T>> {
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

export type UpdateProps<T extends EntityClass<T>> = RequireAtLeastOne<{
  add?: PickByType<EntityProperties<T>, number | Set<unknown>>;
  set?: EntityProperties<T>;
  setIfNotExists?: EntityProperties<T>;
  listAppend?: PickByType<EntityProperties<T>, Array<unknown>>;
  increment?: PickByType<EntityProperties<T>, number>;
  decrement?: PickByType<EntityProperties<T>, number>;
  delete?: PickByType<EntityProperties<T>, Set<unknown>>;
  remove?: Array<EntityKey<T>>;
}>;

export type ReturnValues = 'none' | 'allOld' | 'allNew' | 'updatedOld' | 'updatedNew';

export interface EntityUpdateOptions<T extends EntityClass<T>> {
  extraInput?: Partial<UpdateItemCommandInput>;
  return?: ReturnOption;
  condition?: Condition<T>;
  returnValues?: ReturnValues;
}

export interface BuildUpdateConditionExpression {
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: AttributeMap;
  UpdateExpression?: string;
}

// Entity.put

export interface EntityPutOptions<T extends EntityClass<T>> {
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

export interface EntityDeleteOptions<T extends EntityClass<T>> {
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

export interface EntityBatchGetOptions<T extends EntityClass<T>> {
  extraInput?: Partial<BatchGetItemCommandInput>;
  return?: ReturnOption;
  attributes?: Array<EntityKey<T>>;
  consistent?: boolean;
}

export interface EntityBatchDeleteOutput<PrimaryKey> {
  unprocessedItems: Array<PrimaryKey>;
}

// Entity.batchGet

export interface EntityBatchGetOutput<T extends EntityClass<T>, PrimaryKey> {
  items: Array<InstanceType<T>>;
  unprocessedKeys: Array<PrimaryKey>;
}

// Entity.batchPut

export interface EntityBatchPutOptions {
  extraInput?: Partial<BatchWriteItemCommandInput>;
  return?: ReturnOption;
}

export interface EntityBatchPutOutput<T extends EntityClass<T>> {
  items: Array<InstanceType<T>>;
  unprocessedItems: Array<InstanceType<T>>;
}

// Entity.batchDelete

export interface EntityBatchDeleteOptions {
  extraInput?: Partial<BatchWriteItemCommandInput>;
  return?: ReturnOption;
}
