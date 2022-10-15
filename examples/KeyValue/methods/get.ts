import { KeyValue } from '../model';

async function get() {
  const modelGet = await KeyValue.get({ key: 'key1' });

  console.log();
  console.log('OUTPUT:');
  console.log(modelGet);
}

get();
