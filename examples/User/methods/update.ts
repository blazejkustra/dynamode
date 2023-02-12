import { UserRegistry } from '../model';

async function update() {
  const userUpdate = await UserRegistry.update(
    { partitionKey: 'pk1', sortKey: 'sk1' },
    {
      set: {
        age: 18,
      },
      add: {},
    },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(userUpdate);
}

update();
