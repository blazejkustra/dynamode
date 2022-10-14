import { User } from '../User';

async function deleteFn() {
  const userDelete = await User.delete({ partitionKey: 'pk1', sortKey: 'sk1' });

  console.log();
  console.log('OUTPUT:');
  console.log(userDelete);
}

deleteFn();
