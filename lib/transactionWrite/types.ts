import { ConditionCheck, Delete, Put, TransactWriteItemsCommandInput, Update } from '@aws-sdk/client-dynamodb';
import { Entity } from '@lib/entity';
import type { ReturnOption } from '@lib/entity/types';

export type TransactionUpdate<E extends typeof Entity> = {
  entity: E;
  update: Update;
};
export type TransactionPut<E extends typeof Entity> = { entity: E; put: Put };
export type TransactionDelete<E extends typeof Entity> = {
  entity: E;
  delete: Delete;
};
export type TransactionCondition<E extends typeof Entity> = {
  entity: E;
  condition: ConditionCheck;
};
export type TransactionWrite<E extends typeof Entity> =
  | TransactionUpdate<E>
  | TransactionPut<E>
  | TransactionDelete<E>
  | TransactionCondition<E>;

export type TransactionWriteInput<TW extends Array<TransactionWrite<typeof Entity>>> = {
  readonly [K in keyof TW]: TW[K];
};

export interface TransactionWriteOptions {
  return?: ReturnOption;
  extraInput?: Partial<TransactWriteItemsCommandInput>;
  idempotencyKey?: string;
}

export interface TransactionWriteOutput<TW extends Array<TransactionWrite<typeof Entity>>> {
  items: {
    [K in keyof TW]: TW[K] extends TransactionPut<infer E> ? InstanceType<E> : undefined;
  };
  count: number;
}
