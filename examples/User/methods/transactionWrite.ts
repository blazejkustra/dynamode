import { transactionWrite } from '../../../dist';
import { User, UserManager } from '../model';

async function transaction() {
  const transactions = await transactionWrite([
    UserManager.transaction.update(
      { partitionKey: 'pk1', sortKey: 'sk1' },
      {
        set: {
          age: 18,
        },
      },
      {
        condition: UserManager.condition().attribute('partitionKey').eq('pk1'),
      },
    ),
    UserManager.transaction.put(
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
    UserManager.transaction.create(
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
    UserManager.transaction.delete({ partitionKey: 'pk4', sortKey: 'sk4' }),
    UserManager.transaction.condition(
      { partitionKey: 'pk5', sortKey: 'sk5' },
      UserManager.condition().attribute('partitionKey').eq('pk5'),
    ),
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
