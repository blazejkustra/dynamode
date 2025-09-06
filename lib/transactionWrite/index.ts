import { TransactWriteItemsCommandInput, TransactWriteItemsOutput } from '@aws-sdk/client-dynamodb';
import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import { convertAttributeValuesToEntity } from '@lib/entity/helpers/converters';
import type {
  TransactionWrite,
  TransactionWriteInput,
  TransactionWriteOptions,
  TransactionWriteOutput,
} from '@lib/transactionWrite/types';

/**
 * Executes a DynamoDB TransactWriteItems operation.
 *
 * This function allows you to perform multiple write operations (Put, Update, Delete, ConditionCheck)
 * across one or more tables in a single atomic transaction. All operations succeed or all fail.
 *
 * @param transactions - Array of transaction write operations
 * @param options - Optional configuration for the transaction
 * @returns A promise that resolves to the transaction results
 *
 * @example
 * ```typescript
 * // Perform multiple write operations in a transaction
 * const result = await transactionWrite([
 *   UserManager.transaction.put(new User({ id: 'user-1', name: 'John' })),
 *   UserManager.transaction.update({ id: 'user-2' }, { set: { status: 'active' } }),
 *   UserManager.transaction.delete({ id: 'product-1' }),
 *   UserManager.transaction.condition({ id: 'user-3' }, UserManager.condition().attribute('status').eq('active')),
 * ]);
 *
 * console.log('Transaction completed:', result.count, 'operations');
 * ```
 *
 * see more examples [here](https://blazejkustra.github.io/dynamode/docs/guide/transactions#transactionwritetransactions-options).
 */
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
