import { ConditionCheck, Delete, Put, TransactWriteItemsCommandInput, Update } from '@aws-sdk/client-dynamodb';
import Entity from '@lib/entity';
import type { ReturnOption } from '@lib/entity/types';

/**
 * Transaction update operation for a specific entity.
 *
 * @template E - The entity class type
 */
export type TransactionUpdate<E extends typeof Entity> = {
  /** Entity class for the operation */
  entity: E;
  /** DynamoDB update operation */
  update: Update;
};

/**
 * Transaction put operation for a specific entity.
 *
 * @template E - The entity class type
 */
export type TransactionPut<E extends typeof Entity> = {
  /** Entity class for the operation */
  entity: E;
  /** DynamoDB put operation */
  put: Put;
};

/**
 * Transaction delete operation for a specific entity.
 *
 * @template E - The entity class type
 */
export type TransactionDelete<E extends typeof Entity> = {
  /** Entity class for the operation */
  entity: E;
  /** DynamoDB delete operation */
  delete: Delete;
};

/**
 * Transaction condition check operation for a specific entity.
 *
 * @template E - The entity class type
 */
export type TransactionCondition<E extends typeof Entity> = {
  /** Entity class for the operation */
  entity: E;
  /** DynamoDB condition check operation */
  condition: ConditionCheck;
};

/**
 * Union type for all transaction write operations.
 *
 * @template E - The entity class type
 */
export type TransactionWrite<E extends typeof Entity> =
  | TransactionUpdate<E>
  | TransactionPut<E>
  | TransactionDelete<E>
  | TransactionCondition<E>;

/**
 * Input type for transaction write operations.
 *
 * @template TW - Array of transaction write operations
 */
export type TransactionWriteInput<TW extends Array<TransactionWrite<typeof Entity>>> = {
  readonly [K in keyof TW]: TW[K];
};

/**
 * Options for transaction write operations.
 */
export type TransactionWriteOptions = {
  /** Return type option */
  return?: ReturnOption;
  /** Additional DynamoDB transaction write input parameters */
  extraInput?: Partial<TransactWriteItemsCommandInput>;
  /** Idempotency key for the transaction */
  idempotencyKey?: string;
};

/**
 * Output from transaction write operations.
 *
 * @template TW - Array of transaction write operations
 */
export type TransactionWriteOutput<TW extends Array<TransactionWrite<typeof Entity>>> = {
  /** Array of items from put operations */
  items: {
    [K in keyof TW]: TW[K] extends TransactionPut<infer E> ? InstanceType<E> : undefined;
  };
  /** Number of operations in the transaction */
  count: number;
};
