import { TransactGetItemsCommandInput, TransactGetItemsOutput, TransactWriteItemsCommandInput, TransactWriteItemsOutput } from '@aws-sdk/client-dynamodb';
import { Entity } from '@lib/entity/types';
import { getDynamodeStorage } from '@lib/storage';
import { GetTransaction, TransactionGetOptions, TransactionGetOutput, TransactionWriteOptions, TransactionWriteOutput, WriteTransaction } from '@lib/transaction/types';
import { NotFoundError } from '@lib/utils';

export function transactionGet<T extends Entity<T>>(transactions: Array<GetTransaction<T>>): Promise<TransactionGetOutput<T>>;
export function transactionGet<T extends Entity<T>>(transactions: Array<GetTransaction<T>>, options: TransactionGetOptions & { return: 'default' }): Promise<TransactionGetOutput<T>>;
export function transactionGet<T extends Entity<T>>(transactions: Array<GetTransaction<T>>, options: TransactionGetOptions & { return: 'output' }): Promise<TransactGetItemsOutput>;
export function transactionGet<T extends Entity<T>>(transactions: Array<GetTransaction<T>>, options: TransactionGetOptions & { return: 'input' }): TransactGetItemsCommandInput;
export function transactionGet<T extends Entity<T>>(transactions: Array<GetTransaction<T>>, options?: TransactionGetOptions): Promise<TransactionGetOutput<T> | TransactGetItemsOutput> | TransactGetItemsCommandInput {
  const throwOnNotFound = options?.throwOnNotFound ?? true;
  const commandInput: TransactGetItemsCommandInput = { TransactItems: transactions, ...options?.extraInput };

  if (options?.return === 'input') {
    return commandInput;
  }

  return (async () => {
    const result = await getDynamodeStorage().ddb.transactGetItems(commandInput);
    const responses = result.Responses || [];
    const items = responses.map((response) => response.Item);

    if (throwOnNotFound && items.includes(undefined)) {
      throw new NotFoundError();
    }

    if (options?.return === 'output') {
      return result;
    }

    const entities = items.map((item, idx) => getDynamodeStorage().convertEntityToAttributeMap(item, transactions[idx].Get.TableName)).filter((entity): entity is InstanceType<T> => !!entity);
    return {
      items: entities,
      count: entities.length,
    };
  })();
}

export function transactionWrite<T extends Entity<T>>(transactions: Array<WriteTransaction<T>>): Promise<TransactionWriteOutput<T>>;
export function transactionWrite<T extends Entity<T>>(transactions: Array<WriteTransaction<T>>, options: TransactionWriteOptions & { return: 'default' }): Promise<TransactionWriteOutput<T>>;
export function transactionWrite<T extends Entity<T>>(transactions: Array<WriteTransaction<T>>, options: TransactionWriteOptions & { return: 'output' }): Promise<TransactWriteItemsOutput>;
export function transactionWrite<T extends Entity<T>>(transactions: Array<WriteTransaction<T>>, options: TransactionWriteOptions & { return: 'input' }): TransactWriteItemsCommandInput;
export function transactionWrite<T extends Entity<T>>(transactions: Array<WriteTransaction<T>>, options?: TransactionWriteOptions): Promise<TransactionWriteOutput<T> | TransactWriteItemsOutput> | TransactWriteItemsCommandInput {
  const commandInput: TransactWriteItemsCommandInput = { TransactItems: transactions, ClientRequestToken: options?.idempotencyKey, ...options?.extraInput };

  if (options?.return === 'input') {
    return commandInput;
  }

  return (async () => {
    const result = await getDynamodeStorage().ddb.transactWriteItems(commandInput);

    if (options?.return === 'output') {
      return result;
    }

    const entities = transactions.map((transaction) => getDynamodeStorage().convertEntityToAttributeMap(transaction?.Put?.Item, transaction?.Put?.TableName)).filter((entity): entity is InstanceType<T> => !!entity);
    return {
      items: entities,
      count: entities.length,
    };
  })();
}
