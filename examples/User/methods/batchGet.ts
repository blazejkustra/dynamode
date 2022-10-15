import { User } from '../model';

async function batchGet() {
  const userBatchGet = await User.batchGet([
    { partitionKey: 'pk1', sortKey: 'sk1' },
    { partitionKey: 'pk2', sortKey: 'sk2' },
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(userBatchGet);
}

batchGet();
