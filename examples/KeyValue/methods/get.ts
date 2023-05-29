import { KeyValueManager } from '../model';

async function get() {
  const modelGet = await KeyValueManager.get({ key: 'key1' });

  console.log();
  console.log('OUTPUT:');
  console.log(modelGet);
}

get();
