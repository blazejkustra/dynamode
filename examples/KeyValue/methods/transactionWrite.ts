import { transactionWrite } from '../../../dist';
import { KeyValue, KeyValueRegistry } from '../model';

async function transaction() {
  const transactions = await transactionWrite(
    [
      KeyValueRegistry.transactionUpdate(
        { key: 'key1' },
        {
          set: {
            value: { test: 'test' },
          },
          increment: {},
        },
      ),
      KeyValueRegistry.transactionPut(
        new KeyValue({
          key: 'key2',
          value: { test: '' },
        }),
      ),
      KeyValueRegistry.transactionCreate(
        new KeyValue({
          key: 'key3',
          value: { test: '' },
        }),
      ),
      KeyValueRegistry.transactionDelete({ key: 'key4' }),
      KeyValueRegistry.transactionCondition({ key: 'key5' }, KeyValueRegistry.condition().attribute('key').eq('key5')),
    ],
    { return: 'default' },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
