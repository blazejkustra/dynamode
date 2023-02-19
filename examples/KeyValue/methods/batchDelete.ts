import { keyValueManager } from '../model';

async function batchDelete() {
  const modelBatchDelete = await keyValueManager.batchDelete([{ key: 'key1' }, { key: 'key2' }], { return: 'default' });

  console.log();
  console.log('OUTPUT:');
  console.log(modelBatchDelete);
}

batchDelete();
