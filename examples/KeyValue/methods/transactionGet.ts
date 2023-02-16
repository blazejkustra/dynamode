import { transactionGet } from '../../../dist';
import { KeyValueRegistry } from '../model';

async function transaction() {
  const transactions = await transactionGet([KeyValueRegistry.transaction.get({ key: 'key1' }), KeyValueRegistry.transaction.get({ key: 'key2' })]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
