import { transactionGet } from '../../../dist';
import { AllPossiblePropertiesRegistry } from '../model';

async function transaction() {
  const transactions = await transactionGet([AllPossiblePropertiesRegistry.transactionGet({ partitionKey: 'pk1', sortKey: 'sk1' }), AllPossiblePropertiesRegistry.transactionGet({ partitionKey: 'pk1', sortKey: 'sk1' })]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
