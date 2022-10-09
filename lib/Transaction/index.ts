import { TransactGetItemsCommandInput, TransactGetItemsOutput } from '@aws-sdk/client-dynamodb';
import { Entity } from '@Entity/types';
import { getDynamodeStorage } from '@lib/Storage';
import { NotFoundError } from '@lib/utils';
import { GetTransaction, TransactionGetOptions, TransactionGetOutput } from '@Transaction/types';

export function transactionGet<T extends Entity<T>>(transactions: GetTransaction<T>[]): Promise<TransactionGetOutput<T>>;
export function transactionGet<T extends Entity<T>>(transactions: GetTransaction<T>[], options: TransactionGetOptions & { return: 'default' }): Promise<TransactionGetOutput<T>>;
export function transactionGet<T extends Entity<T>>(transactions: GetTransaction<T>[], options: TransactionGetOptions & { return: 'output' }): Promise<TransactGetItemsOutput>;
export function transactionGet<T extends Entity<T>>(transactions: GetTransaction<T>[], options: TransactionGetOptions & { return: 'input' }): TransactGetItemsCommandInput;
export function transactionGet<T extends Entity<T>>(transactions: GetTransaction<T>[], options?: TransactionGetOptions): Promise<TransactionGetOutput<T> | TransactGetItemsOutput> | TransactGetItemsCommandInput {
  const throwOnNotFound = options?.throwOnNotFound ?? true;
  const commandInput: TransactGetItemsCommandInput = { TransactItems: transactions.map((transaction) => ({ Get: transaction })), ...options?.extraInput };

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

    const entities = items.map((item, idx) => getDynamodeStorage().convertEntityToDynamo(item, transactions[idx].TableName)).filter((entity): entity is InstanceType<T> => !!entity);
    return {
      items: entities,
      count: entities.length,
    };
  })();
}
