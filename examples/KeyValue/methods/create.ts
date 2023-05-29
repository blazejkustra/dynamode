import { KeyValue, KeyValueManager } from '../model';

async function create() {
  const item = await KeyValueManager.create(
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
