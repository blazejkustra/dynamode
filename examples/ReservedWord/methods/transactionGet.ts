import { transactionGet } from '../../../dist';
import { EntityReservedWord } from '../EntityReservedWord';

async function transaction() {
  const transactions = await transactionGet([EntityReservedWord.transactionGet({ COLUMN: 'pk1', OBJECT: 'sk1' }), EntityReservedWord.transactionGet({ COLUMN: 'pk2', OBJECT: 'sk2' })]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
