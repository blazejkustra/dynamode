import transactionGet from '../../../dist/transactionGet';
import { AllPossiblePropertiesManager } from '../model';

async function transaction() {
  const transactions = await transactionGet([
    AllPossiblePropertiesManager.transaction.get({
      partitionKey: 'pk1',
      sortKey: 'sk1',
    }),
    AllPossiblePropertiesManager.transaction.get({
      partitionKey: 'pk2',
      sortKey: 'sk2',
    }),
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
