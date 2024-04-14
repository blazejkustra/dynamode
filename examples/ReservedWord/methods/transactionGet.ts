import transactionGet from '../../../dist/transactionGet';
import { ReservedWordManager } from '../model';

async function transaction() {
  const transactions = await transactionGet([
    ReservedWordManager.transaction.get({ COLUMN: 'pk1', OBJECT: 'sk1' }),
    ReservedWordManager.transaction.get({ COLUMN: 'pk2', OBJECT: 'sk2' }),
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
