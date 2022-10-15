import { KeyValue } from '../model';

async function update() {
  const userUpdate = await KeyValue.update(
    { key: 'key1' },
    {
      set: {
        'value.lol': 2,
      },
      remove: [],
    },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(userUpdate);
}

update();
