import { KeyValueRegistry } from '../model';

async function get() {
  const modelGet = await KeyValueRegistry.get({ key: 'key1' });

  console.log();
  console.log('OUTPUT:');
  console.log(modelGet);
}

get();
