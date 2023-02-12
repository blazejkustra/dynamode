import { transactionGet } from '../../../dist';
import { KeyValueRegistry } from '../model';

async function transaction() {
  const transactions = await transactionGet([KeyValueRegistry.transactionGet({ key: 'key1' }), KeyValueRegistry.transactionGet({ key: 'key2' })]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
