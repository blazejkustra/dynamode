import { transactionWrite } from '../../../dist';
import { KeyValue, KeyValueManager } from '../model';

async function transaction() {
  const transactions = await transactionWrite(
    [
      KeyValueManager.transaction.update(
        { key: 'key1' },
        {
          set: {
            value: { test: 'test' },
          },
          increment: {},
        },
      ),
      KeyValueManager.transaction.put(
        new KeyValue({
          key: 'key2',
          value: { test: '' },
        }),
      ),
      KeyValueManager.transaction.create(
        new KeyValue({
          key: 'key3',
          value: { test: '' },
        }),
      ),
      KeyValueManager.transaction.delete({ key: 'key4' }),
      KeyValueManager.transaction.condition({ key: 'key5' }, KeyValueManager.condition().attribute('key').eq('key5')),
    ],
    { return: 'default' },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
