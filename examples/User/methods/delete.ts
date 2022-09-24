import { User } from '../User';

async function deleteFn() {
  const userDelete = await User.delete({ PK: 'pk', SK: 'sk' });

  console.log();
  console.log('OUTPUT:');
  console.log(userDelete);
}

deleteFn();
