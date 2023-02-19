import { KeyValue, keyValueManager } from '../model';

async function create() {
  const item = await keyValueManager.create(
    new KeyValue({
      key: 'key1',
      value: { test: 123 },
    }),
  );

  console.log();
  console.log('OUTPUT:');
  console.log(item);
}

create();
