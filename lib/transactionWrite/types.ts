import { ConditionCheck, Delete, Put, TransactWriteItemsCommandInput, Update } from '@aws-sdk/client-dynamodb';
import { Entity } from '@lib/entity';
import type { ReturnOption } from '@lib/entity/types';

export type WriteTransaction<E extends typeof Entity> = { Update?: Update; Put?: Put; Delete?: Delete; ConditionCheck?: ConditionCheck } & E;

export interface TransactionWriteOptions {
  extraInput?: Partial<TransactWriteItemsCommandInput>;
  return?: ReturnOption;
  idempotencyKey?: string;
}

export interface TransactionWriteOutput<E extends typeof Entity> {
  items: Array<InstanceType<E>>;
  count: number;
}
