import { transactionGet } from '../../../dist';
import { AllPossiblePropertiesRegistry } from '../model';

async function transaction() {
  const transactions = await transactionGet([
    AllPossiblePropertiesRegistry.transaction.get({
      partitionKey: 'pk1',
      sortKey: 'sk1',
    }),
    AllPossiblePropertiesRegistry.transaction.get({
      partitionKey: 'pk1',
      sortKey: 'sk1',
    }),
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
