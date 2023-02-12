import { KeyValueRegistry } from '../model';

async function batchGet() {
  const modelBatchGet = await KeyValueRegistry.batchGet([{ key: 'key1' }, { key: 'key2' }]);

  console.log();
  console.log('OUTPUT:');
  console.log(modelBatchGet);
}

batchGet();
