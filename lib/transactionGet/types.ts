import { Get, TransactGetItemsCommandInput } from '@aws-sdk/client-dynamodb';
import Entity from '@lib/entity';
import type { ReturnOption } from '@lib/entity/types';

/**
 * Transaction get operation for a specific entity.
 *
 * @template E - The entity class type
 */
export type TransactionGet<E extends typeof Entity> = {
  /** DynamoDB get operation */
  get: Get;
  /** Entity class for the operation */
  entity: E;
};

/**
 * Input type for transaction get operations.
 *
 * @template E - Array of entity class types
 */
export type TransactionGetInput<E extends Array<typeof Entity>> = {
  readonly [K in keyof E]: TransactionGet<E[K]>;
};

/**
 * Options for transaction get operations.
 */
export type TransactionGetOptions = {
  /** Return type option */
  return?: ReturnOption;
  /** Additional DynamoDB transaction get input parameters */
  extraInput?: Partial<TransactGetItemsCommandInput>;
  /** Whether to throw an error if items are not found */
  throwOnNotFound?: boolean;
};

/**
 * Output from transaction get operations.
 *
 * @template E - Array of entity class types
 * @template Extra - Additional type for items that couldn't be retrieved
 */
export type TransactionGetOutput<E extends Array<typeof Entity>, Extra = never> = {
  /** Array of retrieved entity instances */
  items: { [K in keyof E]: InstanceType<E[K]> | Extra };
  /** Number of items retrieved */
  count: number;
};
