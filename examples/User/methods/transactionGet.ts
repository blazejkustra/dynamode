import { transactionGet } from '../../../dist';
import { UserRegistry } from '../model';

async function transaction() {
  const transactions = await transactionGet([UserRegistry.transactionGet({ partitionKey: 'pk1', sortKey: 'sk1' }), UserRegistry.transactionGet({ partitionKey: 'pk1', sortKey: 'sk1' })]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
