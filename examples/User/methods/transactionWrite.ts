import { transactionWrite } from '../../../dist';
import { User } from '../model';

async function transaction() {
  const transactions = await transactionWrite([
    User.transactionUpdate(
      { partitionKey: 'pk1', sortKey: 'sk1' },
      {
        set: {
          age: 18,
        },
      },
      { condition: User.condition().attribute('partitionKey').eq('pk1') },
    ),
    User.transactionPut(
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
    User.transactionCreate(
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
    User.transactionDelete({ partitionKey: 'pk4', sortKey: 'sk4' }),
    User.transactionCondition({ partitionKey: 'pk5', sortKey: 'sk5' }, User.condition().attribute('partitionKey').eq('pk5')),
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
