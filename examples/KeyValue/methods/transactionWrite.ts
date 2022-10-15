import { transactionWrite } from '../../../dist';
import { KeyValue } from '../model';

async function transaction() {
  const transactions = await transactionWrite(
    [
      KeyValue.transactionUpdate(
        { key: 'key1' },
        {
          set: {
            value: { test: 'test' },
          },
          increment: {},
        },
      ),
      KeyValue.transactionPut(
        new KeyValue({
          key: 'key2',
          value: { test: '' },
        }),
      ),
      KeyValue.transactionCreate(
        new KeyValue({
          key: 'key3',
          value: { test: '' },
        }),
      ),
      KeyValue.transactionDelete({ key: 'key4' }),
      KeyValue.transactionCondition({ key: 'key5' }, KeyValue.condition().attribute('key').eq('key5')),
    ],
    { return: 'default' },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
