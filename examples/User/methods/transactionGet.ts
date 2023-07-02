import transactionGet from '../../../dist/transactionGet';
import { UserManager } from '../model';

async function transaction() {
  const transactions = await transactionGet([
    UserManager.transaction.get({ partitionKey: 'pk1', sortKey: 'sk1' }),
    UserManager.transaction.get({ partitionKey: 'pk1', sortKey: 'sk1' }),
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
