import { ConditionCheck, Delete, Put, TransactWriteItemsCommandInput, Update } from '@aws-sdk/client-dynamodb';
import { Entity, ReturnOption } from '@lib/entity/types';

export type WriteTransaction<T extends Entity<T>> = { Update?: Update; Put?: Put; Delete?: Delete; ConditionCheck?: ConditionCheck } & T;

export interface TransactionWriteOptions {
  extraInput?: Partial<TransactWriteItemsCommandInput>;
  return?: ReturnOption;
  idempotencyKey?: string;
}

export interface TransactionWriteOutput<T extends Entity<T>> {
  items: Array<InstanceType<T>>;
  count: number;
}
