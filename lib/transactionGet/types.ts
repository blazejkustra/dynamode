import { Get, TransactGetItemsCommandInput } from '@aws-sdk/client-dynamodb';
import Entity from '@lib/entity';
import type { ReturnOption } from '@lib/entity/types';

export interface TransactionGet<E extends typeof Entity> {
  get: Get;
  entity: E;
}

export type TransactionGetInput<E extends Array<typeof Entity>> = {
  readonly [K in keyof E]: TransactionGet<E[K]>;
};

export interface TransactionGetOptions {
  return?: ReturnOption;
  extraInput?: Partial<TransactGetItemsCommandInput>;
  throwOnNotFound?: boolean;
}

export interface TransactionGetOutput<E extends Array<typeof Entity>, Extra = never> {
  items: { [K in keyof E]: InstanceType<E[K]> | Extra };
  count: number;
}
