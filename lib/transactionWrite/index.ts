import { TransactWriteItemsCommandInput, TransactWriteItemsOutput } from '@aws-sdk/client-dynamodb';
import { Dynamode } from '@lib/dynamode';
import { convertEntityToAttributeValues } from '@lib/entity/helpers';
import type { Entity } from '@lib/entity/types';
import type { TransactionWriteOptions, TransactionWriteOutput, WriteTransaction } from '@lib/transactionWrite/types';

export default function transactionWrite<T extends Entity<T>>(transactions: Array<WriteTransaction<T>>): Promise<TransactionWriteOutput<T>>;
export default function transactionWrite<T extends Entity<T>>(transactions: Array<WriteTransaction<T>>, options: TransactionWriteOptions & { return: 'default' }): Promise<TransactionWriteOutput<T>>;
export default function transactionWrite<T extends Entity<T>>(transactions: Array<WriteTransaction<T>>, options: TransactionWriteOptions & { return: 'output' }): Promise<TransactWriteItemsOutput>;
export default function transactionWrite<T extends Entity<T>>(transactions: Array<WriteTransaction<T>>, options: TransactionWriteOptions & { return: 'input' }): TransactWriteItemsCommandInput;
export default function transactionWrite<T extends Entity<T>>(transactions: Array<WriteTransaction<T>>, options?: TransactionWriteOptions): Promise<TransactionWriteOutput<T> | TransactWriteItemsOutput> | TransactWriteItemsCommandInput {
  const commandInput: TransactWriteItemsCommandInput = { TransactItems: transactions, ClientRequestToken: options?.idempotencyKey, ...options?.extraInput };

  if (options?.return === 'input') {
    return commandInput;
  }

  return (async () => {
    const result = await Dynamode.ddb.get().transactWriteItems(commandInput);

    if (options?.return === 'output') {
      return result;
    }

    const entities = transactions.map((transaction) => convertEntityToAttributeValues(transaction?.Put?.Item, transaction?.Put?.TableName)).filter((entity): entity is InstanceType<T> => !!entity);

    return {
      items: entities,
      count: entities.length,
    };
  })();
}
