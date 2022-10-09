import { TransactWriteItemsCommandInput, TransactWriteItemsOutput } from '@aws-sdk/client-dynamodb';
import { Entity } from '@lib/entity/types';
import { getDynamodeStorage } from '@lib/storage';
import { TransactionWriteOptions, TransactionWriteOutput, WriteTransaction } from '@lib/transactionWrite/types';

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
