import { transactionWrite } from '../../../dist';
import { User, UserRegistry } from '../model';

async function transaction() {
  const transactions = await transactionWrite([
    UserRegistry.transactionUpdate(
      { partitionKey: 'pk1', sortKey: 'sk1' },
      {
        set: {
          age: 18,
        },
      },
      { condition: UserRegistry.condition().attribute('partitionKey').eq('pk1') },
    ),
    UserRegistry.transactionPut(
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
    UserRegistry.transactionCreate(
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
    UserRegistry.transactionDelete({ partitionKey: 'pk4', sortKey: 'sk4' }),
    UserRegistry.transactionCondition({ partitionKey: 'pk5', sortKey: 'sk5' }, UserRegistry.condition().attribute('partitionKey').eq('pk5')),
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
