import { userManager } from '../model';

async function deleteFn() {
  const userDelete = await userManager.delete({ partitionKey: 'pk1', sortKey: 'sk1' });

  console.log();
  console.log('OUTPUT:');
  console.log(userDelete);
}

deleteFn();
