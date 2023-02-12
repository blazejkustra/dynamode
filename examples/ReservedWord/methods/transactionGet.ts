import { transactionGet } from '../../../dist';
import { EntityReservedWordRegistry } from '../model';

async function transaction() {
  const transactions = await transactionGet([EntityReservedWordRegistry.transactionGet({ COLUMN: 'pk1', OBJECT: 'sk1' }), EntityReservedWordRegistry.transactionGet({ COLUMN: 'pk2', OBJECT: 'sk2' })]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
