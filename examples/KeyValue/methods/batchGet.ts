import { keyValueManager } from '../model';

async function batchGet() {
  const modelBatchGet = await keyValueManager.batchGet([{ key: 'key1' }, { key: 'key2' }]);

  console.log();
  console.log('OUTPUT:');
  console.log(modelBatchGet);
}

batchGet();
