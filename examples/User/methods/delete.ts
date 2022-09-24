import { User } from '../User';

async function deleteFn() {
  const userDelete = await User.delete({ PK: 'pk1', SK: 'sk1' });

  console.log();
  console.log('OUTPUT:');
  console.log(userDelete);
}

deleteFn();
