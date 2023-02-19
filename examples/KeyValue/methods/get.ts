import { keyValueManager } from '../model';

async function get() {
  const modelGet = await keyValueManager.get({ key: 'key1' });

  console.log();
  console.log('OUTPUT:');
  console.log(modelGet);
}

get();
