import { User } from '../User';

async function get() {
  const userGet = await User.get({ PK: 'pk1', SK: 'sk1' });

  console.log();
  console.log('OUTPUT:');
  console.log(userGet);
}

get();
