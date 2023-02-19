import { transactionGet } from '../../../dist';
import { keyValueManager } from '../model';

async function transaction() {
  const transactions = await transactionGet([
    keyValueManager.transaction.get({ key: 'key1' }),
    keyValueManager.transaction.get({ key: 'key2' }),
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
