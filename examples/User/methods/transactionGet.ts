import { transactionGet } from '../../../dist';
import { userManager } from '../model';

async function transaction() {
  const transactions = await transactionGet([
    userManager.transaction.get({ partitionKey: 'pk1', sortKey: 'sk1' }),
    userManager.transaction.get({ partitionKey: 'pk1', sortKey: 'sk1' }),
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
