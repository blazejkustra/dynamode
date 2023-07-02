import transactionGet from '../../../dist/transactionGet';
import { KeyValueManager } from '../model';

async function transaction() {
  const transactions = await transactionGet([
    KeyValueManager.transaction.get({ key: 'key1' }),
    KeyValueManager.transaction.get({ key: 'key2' }),
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
