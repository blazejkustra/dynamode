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

/**
 * Return type options for DynamoDB operations.
 */
export type ReturnOption = 'default' | 'input' | 'output';

/**
 * Return values options for DynamoDB operations.
 */
export type ReturnValues = 'none' | 'allOld' | 'allNew' | 'updatedOld' | 'updatedNew';

/**
 * Limited return values options for DynamoDB operations.
 */
export type ReturnValuesLimited = 'none' | 'allOld';

/**
 * Entity property types and utilities.
 */

/**
 * Properties of an entity instance.
 *
 * @template E - The entity class type
 */
export type EntityProperties<E extends typeof Entity> = Partial<FlattenObject<InstanceType<E>>>;

/**
 * Key names of an entity.
 *
 * @template E - The entity class type
 */
export type EntityKey<E extends typeof Entity> = keyof EntityProperties<E> extends string
  ? keyof EntityProperties<E>
  : never;

/**
 * Value type for a specific entity key.
 *
 * @template E - The entity class type
 * @template K - The key type
 */
export type EntityValue<E extends typeof Entity, K extends EntityKey<E>> = FlattenObject<InstanceType<E>>[K];

/**
 * Options for entity get operations.
 *
 * @template E - The entity class type
 */
export type EntityGetOptions<E extends typeof Entity> = {
  /** Additional DynamoDB input parameters */
  extraInput?: Partial<GetItemCommandInput>;
  /** Return type option */
  return?: ReturnOption;
  /** Specific attributes to retrieve */
  attributes?: Array<EntityKey<E>>;
  /** Whether to use consistent read */
  consistent?: boolean;
};

/**
 * Built projection expression for get operations.
 */
export type BuildGetProjectionExpression = {
  /** Attribute names mapping */
  attributeNames?: AttributeNames;
  /** Projection expression string */
  projectionExpression?: string;
};

// entityManager.update

/**
 * Utility type to pick properties of a specific type.
 *
 * @template T - The object type
 * @template Value - The value type to filter by
 */
export type PickByType<T, Value> =
  Omit<
    {
      [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P];
    },
    'dynamodeEntity'
  > extends infer U
    ? U extends Record<string, never>
      ? Record<string, never>
      : U | Record<string, never>
    : never;

/**
 * Update operations for entity update operations.
 *
 * @template E - The entity class type
 */
export type UpdateProps<E extends typeof Entity> = RequireAtLeastOne<{
  /** ADD operation for numbers and sets */
  add?: PickByType<EntityProperties<E>, number | Set<unknown>>;
  /** SET operation for setting attribute values */
  set?: EntityProperties<E>;
  /** SET operation only if attribute doesn't exist */
  setIfNotExists?: EntityProperties<E>;
  /** LIST_APPEND operation for arrays */
  listAppend?: PickByType<EntityProperties<E>, Array<unknown>>;
  /** Increment operation for numbers */
  increment?: PickByType<EntityProperties<E>, number>;
  /** Decrement operation for numbers */
  decrement?: PickByType<EntityProperties<E>, number>;
  /** DELETE operation for sets */
  delete?: PickByType<EntityProperties<E>, Set<unknown>>;
  /** REMOVE operation for removing attributes */
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

// entityManager.transaction.update

export type EntityTransactionUpdateOptions<E extends typeof Entity> = {
  extraInput?: Partial<Update>;
  condition?: Condition<E>;
  returnValuesOnFailure?: ReturnValuesLimited;
};

// entityManager.transaction.put

export type EntityTransactionPutOptions<E extends typeof Entity> = {
  extraInput?: Partial<Put>;
  overwrite?: boolean;
  condition?: Condition<E>;
  returnValuesOnFailure?: ReturnValuesLimited;
};

// entityManager.transaction.delete

export type EntityTransactionDeleteOptions<E extends typeof Entity> = {
  extraInput?: Partial<Delete>;
  condition?: Condition<E>;
};
