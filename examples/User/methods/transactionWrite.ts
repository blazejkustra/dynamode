import { transactionWrite } from '../../../dist';
import { User, userManager } from '../model';

async function transaction() {
  const transactions = await transactionWrite([
    userManager.transaction.update(
      { partitionKey: 'pk1', sortKey: 'sk1' },
      {
        set: {
          age: 18,
        },
      },
      {
        condition: userManager.condition().attribute('partitionKey').eq('pk1'),
      },
    ),
    userManager.transaction.put(
      new User({
        partitionKey: 'pk2',
        sortKey: 'sk2',
        username: 'blazej',
        email: 'blazej@gmail.com',
        age: 18,
        friends: ['tomas', 'david'],
        config: {
          isAdmin: true,
        },
      }),
    ),
    userManager.transaction.create(
      new User({
        partitionKey: 'pk3',
        sortKey: 'sk3',
        username: 'blazej',
        email: 'blazej@gmail.com',
        age: 18,
        friends: ['tomas', 'david'],
        config: {
          isAdmin: true,
        },
      }),
    ),
    userManager.transaction.delete({ partitionKey: 'pk4', sortKey: 'sk4' }),
    userManager.transaction.condition(
      { partitionKey: 'pk5', sortKey: 'sk5' },
      userManager.condition().attribute('partitionKey').eq('pk5'),
    ),
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
