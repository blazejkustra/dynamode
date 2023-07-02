import transactionGet from '../../../dist/transactionGet';
import { ReservedWordManager } from '../model';

async function transaction() {
  const transactions = await transactionGet([
    ReservedWordManager.transactionGet({ COLUMN: 'pk1', OBJECT: 'sk1' }),
    ReservedWordManager.transactionGet({ COLUMN: 'pk2', OBJECT: 'sk2' }),
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
