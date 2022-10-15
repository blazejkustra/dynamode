import { User } from '../model';

async function get() {
  const userGet = await User.get({ partitionKey: 'pk1', sortKey: 'sk1' });

  console.log();
  console.log('OUTPUT:');
  console.log(userGet);
}

get();
