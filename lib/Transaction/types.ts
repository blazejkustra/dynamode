import { ConditionCheck, Delete, Get, Put, TransactGetItemsCommandInput, TransactWriteItemsCommandInput, Update } from '@aws-sdk/client-dynamodb';
import { Entity, ReturnOption } from '@lib/entity/types';

export type UpdateTransaction<T extends Entity<T>> = { Update: Update } & T;
export type PutTransaction<T extends Entity<T>> = { Put: Put } & T;
export type DeleteTransaction<T extends Entity<T>> = { Delete: Delete } & T;
export type ConditionTransaction<T extends Entity<T>> = { ConditionCheck: ConditionCheck } & T;

export type GetTransaction<T extends Entity<T>> = { Get: Get } & T;
export type WriteTransaction<T extends Entity<T>> = { Update?: Update; Put?: Put; Delete?: Delete; ConditionCheck?: ConditionCheck } & T;

// transactionGet

export interface TransactionGetOptions {
  extraInput?: Partial<TransactGetItemsCommandInput>;
  return?: ReturnOption;
  throwOnNotFound?: boolean;
}

export interface TransactionGetOutput<T extends Entity<T>> {
  items: Array<InstanceType<T>>;
  count: number;
}

// transactionWrite

export interface TransactionWriteOptions {
  extraInput?: Partial<TransactWriteItemsCommandInput>;
  return?: ReturnOption;
  idempotencyKey?: string;
}

export interface TransactionWriteOutput<T extends Entity<T>> {
  items: Array<InstanceType<T>>;
  count: number;
}
