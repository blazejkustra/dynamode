import { Get, TransactGetItemsCommandInput } from '@aws-sdk/client-dynamodb';
import { Entity, ReturnOption } from '@lib/Entity/types';

export type GetTransaction<T extends Entity<T>> = Get & T;

export interface TransactionGetOptions {
  extraInput?: Partial<TransactGetItemsCommandInput>;
  return?: ReturnOption;
  throwOnNotFound?: boolean;
}

export interface TransactionGetOutput<T extends Entity<T>> {
  items: Array<InstanceType<T>>;
  count: number;
}
