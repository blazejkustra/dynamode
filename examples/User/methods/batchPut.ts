import { User, userManager } from '../model';

async function batchPut() {
  const userBatchPut = await userManager.batchPut([
    new User({
      partitionKey: 'pk1',
      sortKey: 'sk1',
      username: 'blazej',
      email: 'blazej@gmail.com',
      age: 18,
      friends: ['tomas', 'david'],
      config: {
        isAdmin: true,
      },
    }),
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
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(userBatchPut);
}

batchPut();
