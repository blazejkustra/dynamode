import { transactionGet } from '../../../dist';
import { AllPossibleProperties } from '../model';

async function transaction() {
  const transactions = await transactionGet([AllPossibleProperties.transactionGet({ partitionKey: 'pk1', sortKey: 'sk1' }), AllPossibleProperties.transactionGet({ partitionKey: 'pk1', sortKey: 'sk1' })]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
