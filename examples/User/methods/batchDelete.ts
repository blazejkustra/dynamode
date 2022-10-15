import { User } from '../model';

async function batchDelete() {
  const userBatchDelete = await User.batchDelete(
    [
      { partitionKey: 'pk1', sortKey: 'sk1' },
      { partitionKey: 'pk2', sortKey: 'sk2' },
    ],
    { return: 'default' },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(userBatchDelete);
}

batchDelete();
