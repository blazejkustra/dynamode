import { KeyValue } from '../model';

async function batchDelete() {
  const modelBatchDelete = await KeyValue.batchDelete([{ key: 'key1' }, { key: 'key2' }], { return: 'default' });

  console.log();
  console.log('OUTPUT:');
  console.log(modelBatchDelete);
}

batchDelete();
