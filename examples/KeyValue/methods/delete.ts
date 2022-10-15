import { KeyValue } from '../model';

async function deleteFn() {
  const modelDelete = await KeyValue.delete({ key: 'key1' });

  console.log();
  console.log('OUTPUT:');
  console.log(modelDelete);
}

deleteFn();
