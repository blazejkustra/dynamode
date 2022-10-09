import { transactionGet } from '../../../dist';
import { User } from '../User';
import { UserConfig } from '../UserConfig';

async function transaction() {
  const transactions = await transactionGet([User.transactionGet({ PK: 'pk1', SK: 'sk1' }), UserConfig.transactionGet({ PK: 'pk1', SK: 'sk1' })]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
