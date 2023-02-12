import { TransactWriteItemsCommandInput, TransactWriteItemsOutput } from '@aws-sdk/client-dynamodb';
import { Dynamode } from '@lib/dynamode';
import { Entity } from '@lib/entity';
import { convertAttributeValuesToEntity } from '@lib/entity/helpers';
import type { TransactionWriteOptions, TransactionWriteOutput, WriteTransaction } from '@lib/transactionWrite/types';

export default function transactionWrite<E extends typeof Entity>(transactions: Array<WriteTransaction<E>>): Promise<TransactionWriteOutput<E>>;
export default function transactionWrite<E extends typeof Entity>(transactions: Array<WriteTransaction<E>>, options: TransactionWriteOptions & { return: 'default' }): Promise<TransactionWriteOutput<E>>;
export default function transactionWrite<E extends typeof Entity>(transactions: Array<WriteTransaction<E>>, options: TransactionWriteOptions & { return: 'output' }): Promise<TransactWriteItemsOutput>;
export default function transactionWrite<E extends typeof Entity>(transactions: Array<WriteTransaction<E>>, options: TransactionWriteOptions & { return: 'input' }): TransactWriteItemsCommandInput;
export default function transactionWrite<E extends typeof Entity>(transactions: Array<WriteTransaction<E>>, options?: TransactionWriteOptions): Promise<TransactionWriteOutput<E> | TransactWriteItemsOutput> | TransactWriteItemsCommandInput {
  const commandInput: TransactWriteItemsCommandInput = { TransactItems: transactions, ClientRequestToken: options?.idempotencyKey, ...options?.extraInput };

  if (options?.return === 'input') {
    return commandInput;
  }

  return (async () => {
    const result = await Dynamode.ddb.get().transactWriteItems(commandInput);

    if (options?.return === 'output') {
      return result;
    }

    const entities = transactions
      .map((transaction) => {
        const item = transaction?.Put?.Item;
        const tableName = transaction?.Put?.TableName;
        if (item && tableName) {
          return convertAttributeValuesToEntity(tableName, item);
        }
      })
      .filter((entity): entity is InstanceType<E> => !!entity);

    return {
      items: entities,
      count: entities.length,
    };
  })();
}
