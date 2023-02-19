import { userManager } from '../model';

async function get() {
  const userGet = await userManager.get({ partitionKey: 'pk1', sortKey: 'sk1' });

  console.log();
  console.log('OUTPUT:');
  console.log(userGet);
}

get();
