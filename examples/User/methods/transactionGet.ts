import { transactionGet } from '../../../dist';
import { User } from '../model';

async function transaction() {
  const transactions = await transactionGet([User.transactionGet({ partitionKey: 'pk1', sortKey: 'sk1' }), User.transactionGet({ partitionKey: 'pk1', sortKey: 'sk1' })]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
