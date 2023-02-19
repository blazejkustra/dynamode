import { transactionGet } from '../../../dist';
import { reservedWordManager } from '../model';

async function transaction() {
  const transactions = await transactionGet([
    reservedWordManager.transactionGet({ COLUMN: 'pk1', OBJECT: 'sk1' }),
    reservedWordManager.transactionGet({ COLUMN: 'pk2', OBJECT: 'sk2' }),
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
