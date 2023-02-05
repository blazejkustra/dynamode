import { TransactGetItemsCommandInput, TransactGetItemsOutput } from '@aws-sdk/client-dynamodb';
import { Dynamode } from '@lib/dynamode';
import { convertEntityToAttributeValues } from '@lib/entity/helpers';
import type { Entity } from '@lib/entity/types';
import type { GetTransaction, TransactionGetOptions, TransactionGetOutput } from '@lib/transactionGet/types';
import { NotFoundError } from '@lib/utils';

export default function transactionGet<T extends Entity<T>>(transactions: Array<GetTransaction<T>>): Promise<TransactionGetOutput<T>>;
export default function transactionGet<T extends Entity<T>>(transactions: Array<GetTransaction<T>>, options: TransactionGetOptions & { return: 'default' }): Promise<TransactionGetOutput<T>>;
export default function transactionGet<T extends Entity<T>>(transactions: Array<GetTransaction<T>>, options: TransactionGetOptions & { return: 'output' }): Promise<TransactGetItemsOutput>;
export default function transactionGet<T extends Entity<T>>(transactions: Array<GetTransaction<T>>, options: TransactionGetOptions & { return: 'input' }): TransactGetItemsCommandInput;
export default function transactionGet<T extends Entity<T>>(transactions: Array<GetTransaction<T>>, options?: TransactionGetOptions): Promise<TransactionGetOutput<T> | TransactGetItemsOutput> | TransactGetItemsCommandInput {
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

    const entities = items.map((item, idx) => convertEntityToAttributeValues(item, transactions[idx].Get.TableName)).filter((entity): entity is InstanceType<T> => !!entity);

    return {
      items: entities,
      count: entities.length,
    };
  })();
}
