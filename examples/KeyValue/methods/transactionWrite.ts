import { transactionWrite } from '../../../dist';
import { KeyValue, KeyValueRegistry } from '../model';

async function transaction() {
  const transactions = await transactionWrite(
    [
      KeyValueRegistry.transaction.update(
        { key: 'key1' },
        {
          set: {
            value: { test: 'test' },
          },
          increment: {},
        },
      ),
      KeyValueRegistry.transaction.put(
        new KeyValue({
          key: 'key2',
          value: { test: '' },
        }),
      ),
      KeyValueRegistry.transaction.create(
        new KeyValue({
          key: 'key3',
          value: { test: '' },
        }),
      ),
      KeyValueRegistry.transaction.delete({ key: 'key4' }),
      KeyValueRegistry.transaction.condition({ key: 'key5' }, KeyValueRegistry.condition().attribute('key').eq('key5')),
    ],
    { return: 'default' },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
