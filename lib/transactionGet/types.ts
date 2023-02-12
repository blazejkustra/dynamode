import { Get, TransactGetItemsCommandInput } from '@aws-sdk/client-dynamodb';
import { Entity } from '@lib/entity';
import type { ReturnOption } from '@lib/entity/types';

export type GetTransaction<E> = { Get: Get } & E;

export interface TransactionGetOptions {
  extraInput?: Partial<TransactGetItemsCommandInput>;
  return?: ReturnOption;
  throwOnNotFound?: boolean;
}

export interface TransactionGetOutput<E extends typeof Entity> {
  items: Array<InstanceType<E>>;
  count: number;
}
