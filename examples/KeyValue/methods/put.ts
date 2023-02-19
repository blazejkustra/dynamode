import { KeyValue, keyValueManager } from '../model';

async function put() {
  const item = await keyValueManager.put(
    new KeyValue({
      key: 'key1',
      value: { test: 123 },
    }),
  );

  console.log();
  console.log('OUTPUT:');
  console.log(item);
}

put();
