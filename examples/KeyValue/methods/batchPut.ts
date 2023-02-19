import { KeyValue, keyValueManager } from '../model';

async function batchPut() {
  const modelBatchPut = await keyValueManager.batchPut([
    new KeyValue({
      key: 'key1',
      value: { test: 123 },
    }),
    new KeyValue({
      key: 'key2',
      value: { test: 123 },
    }),
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(modelBatchPut);
}

batchPut();
