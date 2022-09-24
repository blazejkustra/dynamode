import { User } from '../User';

async function batchDelete() {
  const userBatchDelete = await User.batchDelete(
    [
      { PK: 'pk1', SK: 'sk1' },
      { PK: 'pk2', SK: 'sk2' },
    ],
    { return: 'default' },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(userBatchDelete);
}

batchDelete();
