import { KeyValueRegistry } from '../model';

async function update() {
  const userUpdate = await KeyValueRegistry.update(
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
