import { userManager } from '../model';

async function update() {
  const userUpdate = await userManager.update(
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
