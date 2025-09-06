import { TransactGetItemsCommandInput, TransactGetItemsOutput } from '@aws-sdk/client-dynamodb';
import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import { convertAttributeValuesToEntity } from '@lib/entity/helpers/converters';
import type { TransactionGetInput, TransactionGetOptions, TransactionGetOutput } from '@lib/transactionGet/types';
import { NotFoundError } from '@lib/utils';

/**
 * Executes a DynamoDB TransactGetItems operation.
 *
 * This function allows you to retrieve multiple items from one or more tables
 * in a single atomic operation. All items are retrieved or none are retrieved.
 *
 * @param transactions - Array of transaction get operations
 * @returns A promise that resolves to the transaction results
 * @throws {NotFoundError} When items are not found and throwOnNotFound is true
 *
 * @example
 * ```typescript
 * // Get multiple items in a transaction
 * const result = await transactionGet([
 *   UserManager.transactionGet({ id: 'user-1' }),
 *   UserManager.transactionGet({ id: 'user-2' }),
 *   UserManager.transactionGet({ id: 'product-1' }),
 * ]);
 *
 * console.log('Users:', result.items[0], result.items[1]);
 * console.log('Product:', result.items[2]);
 * ```
 *
 * see more examples [here](https://blazejkustra.github.io/dynamode/docs/guide/transactions#transactiongettransactions-options).
 */
export default function transactionGet<E extends Array<typeof Entity>>(
  transactions: TransactionGetInput<[...E]>,
): Promise<TransactionGetOutput<[...E]>>;

export default function transactionGet<E extends Array<typeof Entity>>(
  transactions: TransactionGetInput<[...E]>,
  options: TransactionGetOptions & {
    return?: 'default';
    throwOnNotFound?: true;
  },
): Promise<TransactionGetOutput<[...E]>>;

export default function transactionGet<E extends Array<typeof Entity>>(
  transactions: TransactionGetInput<[...E]>,
  options: TransactionGetOptions & {
    return?: 'default';
    throwOnNotFound: false;
  },
): Promise<TransactionGetOutput<[...E], undefined>>;

export default function transactionGet<E extends Array<typeof Entity>>(
  transactions: TransactionGetInput<[...E]>,
  options: TransactionGetOptions & { return: 'output' },
): Promise<TransactGetItemsOutput>;

export default function transactionGet<E extends Array<typeof Entity>>(
  transactions: TransactionGetInput<[...E]>,
  options: TransactionGetOptions & { return: 'input' },
): TransactGetItemsCommandInput;

export default function transactionGet<E extends Array<typeof Entity>>(
  transactions: TransactionGetInput<[...E]>,
  options?: TransactionGetOptions,
):
  | Promise<TransactionGetOutput<[...E]> | TransactionGetOutput<[...E], undefined> | TransactGetItemsOutput>
  | TransactGetItemsCommandInput {
  const throwOnNotFound = options?.throwOnNotFound ?? true;
  const commandInput: TransactGetItemsCommandInput = {
    TransactItems: transactions.map((transaction) => ({
      Get: transaction.get,
    })),
    ...options?.extraInput,
  };

  if (options?.return === 'input') {
    return commandInput;
  }

  return (async () => {
    const result = await Dynamode.ddb.get().transactGetItems(commandInput);

    if (options?.return === 'output') {
      return result;
    }

    const responses = result.Responses || [];
    const items = responses.map((response) => response.Item);

    const entities = transactions.map((transaction, idx) => {
      const item = items[idx];

      if (throwOnNotFound && !item) {
        throw new NotFoundError();
      }

      if (item) {
        return convertAttributeValuesToEntity(transaction.entity, item);
      }
    }) as [...TransactionGetOutput<E>['items']];

    return {
      items: entities,
      count: entities.length,
    };
  })();
}
