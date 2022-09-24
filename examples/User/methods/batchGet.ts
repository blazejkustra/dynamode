import { User } from '../User';

async function batchGet() {
  const userBatchGet = await User.batchGet(
    [
      { PK: 'pk1', SK: 'sk1' },
      { PK: 'pk2', SK: 'sk2' },
    ],
    {
      attributes: ['set', 'array'],
    },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(userBatchGet);
}

batchGet();
