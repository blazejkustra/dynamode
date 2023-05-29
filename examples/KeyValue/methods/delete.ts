import { KeyValueManager } from '../model';

async function deleteFn() {
  const modelDelete = await KeyValueManager.delete({ key: 'key1' });

  console.log();
  console.log('OUTPUT:');
  console.log(modelDelete);
}

deleteFn();
