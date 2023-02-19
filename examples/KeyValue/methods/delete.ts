import { keyValueManager } from '../model';

async function deleteFn() {
  const modelDelete = await keyValueManager.delete({ key: 'key1' });

  console.log();
  console.log('OUTPUT:');
  console.log(modelDelete);
}

deleteFn();
