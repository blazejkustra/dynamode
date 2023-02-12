import { KeyValueRegistry } from '../model';

async function deleteFn() {
  const modelDelete = await KeyValueRegistry.delete({ key: 'key1' });

  console.log();
  console.log('OUTPUT:');
  console.log(modelDelete);
}

deleteFn();
