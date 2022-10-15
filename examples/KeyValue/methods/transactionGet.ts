import { transactionGet } from '../../../dist';
import { KeyValue } from '../model';

async function transaction() {
  const transactions = await transactionGet([KeyValue.transactionGet({ key: 'key1' }), KeyValue.transactionGet({ key: 'key2' })]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
