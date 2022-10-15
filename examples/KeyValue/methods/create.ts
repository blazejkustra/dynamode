import { KeyValue } from '../model';

async function create() {
  const item = await KeyValue.create(
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
