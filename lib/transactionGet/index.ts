import { TransactGetItemsCommandInput, TransactGetItemsOutput } from '@aws-sdk/client-dynamodb';
import { Dynamode } from '@lib/dynamode';
import { Entity } from '@lib/entity';
import { convertAttributeValuesToEntity } from '@lib/entity/helpers';
import type { GetTransaction, TransactionGetOptions, TransactionGetOutput } from '@lib/transactionGet/types';
import { NotFoundError } from '@lib/utils';

export default function transactionGet<E extends typeof Entity>(transactions: Array<GetTransaction<E>>): Promise<TransactionGetOutput<E>>;
export default function transactionGet<E extends typeof Entity>(transactions: Array<GetTransaction<E>>, options: TransactionGetOptions & { return: 'default' }): Promise<TransactionGetOutput<E>>;
export default function transactionGet<E extends typeof Entity>(transactions: Array<GetTransaction<E>>, options: TransactionGetOptions & { return: 'output' }): Promise<TransactGetItemsOutput>;
export default function transactionGet<E extends typeof Entity>(transactions: Array<GetTransaction<E>>, options: TransactionGetOptions & { return: 'input' }): TransactGetItemsCommandInput;
export default function transactionGet<E extends typeof Entity>(transactions: Array<GetTransaction<E>>, options?: TransactionGetOptions): Promise<TransactionGetOutput<E> | TransactGetItemsOutput> | TransactGetItemsCommandInput {
  const throwOnNotFound = options?.throwOnNotFound ?? true;
  const commandInput: TransactGetItemsCommandInput = { TransactItems: transactions, ...options?.extraInput };

  if (options?.return === 'input') {
    return commandInput;
  }

  return (async () => {
    const result = await Dynamode.ddb.get().transactGetItems(commandInput);
    const responses = result.Responses || [];
    const items = responses.map((response) => response.Item);

    if (throwOnNotFound && items.includes(undefined)) {
      throw new NotFoundError();
    }

    if (options?.return === 'output') {
      return result;
    }

    const entities = items
      .map((item, idx) => {
        const tableName = transactions[idx].Get.TableName;
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
