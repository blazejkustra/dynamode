import { TransactWriteItemsCommandInput, TransactWriteItemsOutput } from '@aws-sdk/client-dynamodb';
import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import { convertAttributeValuesToEntity } from '@lib/entity/helpers/convert';
import type {
  TransactionWrite,
  TransactionWriteInput,
  TransactionWriteOptions,
  TransactionWriteOutput,
} from '@lib/transactionWrite/types';

export default function transactionWrite<TW extends Array<TransactionWrite<typeof Entity>>>(
  transactions: TransactionWriteInput<[...TW]>,
  options?: TransactionWriteOptions & { return?: 'default' },
): Promise<TransactionWriteOutput<[...TW]>>;

export default function transactionWrite<TW extends Array<TransactionWrite<typeof Entity>>>(
  transactions: TransactionWriteInput<[...TW]>,
  options: TransactionWriteOptions & { return: 'output' },
): Promise<TransactWriteItemsOutput>;

export default function transactionWrite<TW extends Array<TransactionWrite<typeof Entity>>>(
  transactions: TransactionWriteInput<[...TW]>,
  options: TransactionWriteOptions & { return: 'input' },
): TransactWriteItemsCommandInput;

export default function transactionWrite<TW extends Array<TransactionWrite<typeof Entity>>>(
  transactions: TransactionWriteInput<[...TW]>,
  options?: TransactionWriteOptions,
): Promise<TransactionWriteOutput<[...TW]> | TransactWriteItemsOutput> | TransactWriteItemsCommandInput {
  const commandInput: TransactWriteItemsCommandInput = {
    TransactItems: transactions.map((transaction) => ({
      Update: 'update' in transaction ? transaction.update : undefined,
      Put: 'put' in transaction ? transaction.put : undefined,
      ConditionCheck: 'condition' in transaction ? transaction.condition : undefined,
      Delete: 'delete' in transaction ? transaction.delete : undefined,
    })),
    ClientRequestToken: options?.idempotencyKey,
    ...options?.extraInput,
  };

  if (options?.return === 'input') {
    return commandInput;
  }

  return (async () => {
    const result = await Dynamode.ddb.get().transactWriteItems(commandInput);

    if (options?.return === 'output') {
      return result;
    }

    const entities = transactions.map((transaction) => {
      const item = 'put' in transaction ? transaction.put?.Item : undefined;
      if (item) {
        return convertAttributeValuesToEntity(transaction.entity, item);
      }
    }) as [...TransactionWriteOutput<TW>['items']];

    return {
      items: entities,
      count: entities.length,
    };
  })();
}
