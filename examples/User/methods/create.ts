import { User, UserManager } from '../model';

async function create() {
  const user = await UserManager.create(
    new User({
      partitionKey: 'pk1',
      sortKey: 'sk1',
      username: 'blazej',
      email: 'blazej@gmail.com',
      age: 18,
      friends: ['tomas', 'david'],
      config: {
        isAdmin: true,
      },
    }),
  );

  console.log();
  console.log('OUTPUT:');
  console.log(user);
}

create();
