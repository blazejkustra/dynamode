import { transactionWrite } from '../../../dist';
import { KeyValue, keyValueManager } from '../model';

async function transaction() {
  const transactions = await transactionWrite(
    [
      keyValueManager.transaction.update(
        { key: 'key1' },
        {
          set: {
            value: { test: 'test' },
          },
          increment: {},
        },
      ),
      keyValueManager.transaction.put(
        new KeyValue({
          key: 'key2',
          value: { test: '' },
        }),
      ),
      keyValueManager.transaction.create(
        new KeyValue({
          key: 'key3',
          value: { test: '' },
        }),
      ),
      keyValueManager.transaction.delete({ key: 'key4' }),
      keyValueManager.transaction.condition({ key: 'key5' }, keyValueManager.condition().attribute('key').eq('key5')),
    ],
    { return: 'default' },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
