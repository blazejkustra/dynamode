import { RequireAtLeastOne } from 'type-fest';

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
import Entity from '@lib/entity';
import { Metadata, TablePrimaryKey } from '@lib/table/types';
import { AttributeNames, AttributeValues, FlattenObject } from '@lib/utils';

// Return types

export type ReturnOption = 'default' | 'input' | 'output';
export type ReturnValues = 'none' | 'allOld' | 'allNew' | 'updatedOld' | 'updatedNew';
export type ReturnValuesLimited = 'none' | 'allOld';

// Entity Props

export type EntityProperties<E extends typeof Entity> = Partial<FlattenObject<InstanceType<E>>>;
export type EntityKey<E extends typeof Entity> = keyof EntityProperties<E>;
export type EntityValue<E extends typeof Entity, K extends EntityKey<E>> = FlattenObject<InstanceType<E>>[K];

// entityManager.get

export type EntityGetOptions<E extends typeof Entity> = {
  extraInput?: Partial<GetItemCommandInput>;
  return?: ReturnOption;
  attributes?: Array<EntityKey<E>>;
  consistent?: boolean;
};

export type BuildGetProjectionExpression = {
  attributeNames?: AttributeNames;
  projectionExpression?: string;
};

// entityManager.update

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

export type EntityUpdateOptions<E extends typeof Entity> = {
  extraInput?: Partial<UpdateItemCommandInput>;
  return?: ReturnOption;
  condition?: Condition<E>;
  returnValues?: ReturnValues;
};

export type BuildUpdateConditionExpression = {
  attributeNames?: AttributeNames;
  attributeValues?: AttributeValues;
  conditionExpression?: string;
  updateExpression: string;
};

// entityManager.put

export type EntityPutOptions<E extends typeof Entity> = {
  extraInput?: Partial<PutItemCommandInput>;
  return?: ReturnOption;
  overwrite?: boolean;
  condition?: Condition<E>;
};

export type BuildPutConditionExpression = {
  attributeNames?: AttributeNames;
  attributeValues?: AttributeValues;
  conditionExpression?: string;
};

// entityManager.delete

export type EntityDeleteOptions<E extends typeof Entity> = {
  extraInput?: Partial<DeleteItemCommandInput>;
  return?: ReturnOption;
  condition?: Condition<E>;
  throwErrorIfNotExists?: boolean;
  returnValues?: ReturnValuesLimited;
};

export type BuildDeleteConditionExpression = {
  attributeNames?: AttributeNames;
  attributeValues?: AttributeValues;
  conditionExpression?: string;
};

// entityManager.batchGet

export type EntityBatchGetOptions<E extends typeof Entity> = {
  extraInput?: Partial<BatchGetItemCommandInput>;
  return?: ReturnOption;
  attributes?: Array<EntityKey<E>>;
  consistent?: boolean;
};

export type EntityBatchDeleteOutput<PrimaryKey> = {
  unprocessedItems: Array<PrimaryKey>;
};

// entityManager.batchGet

export type EntityBatchGetOutput<M extends Metadata<E>, E extends typeof Entity> = {
  items: Array<InstanceType<E>>;
  unprocessedKeys: Array<TablePrimaryKey<M, E>>;
};

// entityManager.batchPut

export type EntityBatchPutOptions = {
  extraInput?: Partial<BatchWriteItemCommandInput>;
  return?: ReturnOption;
};

export type EntityBatchPutOutput<E extends typeof Entity> = {
  items: Array<InstanceType<E>>;
  unprocessedItems: Array<InstanceType<E>>;
};

// entityManager.batchDelete

export type EntityBatchDeleteOptions = {
  extraInput?: Partial<BatchWriteItemCommandInput>;
  return?: ReturnOption;
};

export type EntityTransactionInput<E, Command extends Get | Update | Put | Delete | ConditionCheck> = Command & {
  entity: E;
};

// entityManager.transactionGet

export type EntityTransactionGetOptions<EntityKey> = {
  extraInput?: Partial<Get>;
  attributes?: Array<EntityKey>;
};

// entityManager.transactionUpdate

export type EntityTransactionUpdateOptions<E extends typeof Entity> = {
  extraInput?: Partial<Update>;
  condition?: Condition<E>;
  returnValuesOnFailure?: ReturnValuesLimited;
};

// entityManager.transactionPut

export type EntityTransactionPutOptions<E extends typeof Entity> = {
  extraInput?: Partial<Put>;
  overwrite?: boolean;
  condition?: Condition<E>;
  returnValuesOnFailure?: ReturnValuesLimited;
};

// entityManager.transactionDelete

export type EntityTransactionDeleteOptions<E extends typeof Entity> = {
  extraInput?: Partial<Delete>;
  condition?: Condition<E>;
};
