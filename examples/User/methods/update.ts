import { User } from '../User';

async function update() {
  const userUpdate = await User.update(
    { partitionKey: 'pk1', sortKey: 'sk1' },
    {
      set: {
        age: 18,
      },
    },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(userUpdate);
}

update();
