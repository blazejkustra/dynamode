import { Get, TransactGetItemsCommandInput } from '@aws-sdk/client-dynamodb';
import type { Entity, ReturnOption } from '@lib/entity/types';

export type GetTransaction<T extends Entity<T>> = { Get: Get } & T;

export interface TransactionGetOptions {
  extraInput?: Partial<TransactGetItemsCommandInput>;
  return?: ReturnOption;
  throwOnNotFound?: boolean;
}

export interface TransactionGetOutput<T extends Entity<T>> {
  items: Array<InstanceType<T>>;
  count: number;
}
