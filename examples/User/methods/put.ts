import { User, UserManager } from '../model';

async function put() {
  const user = await UserManager.put(
    new User({
      partitionKey: '1',
      sortKey: 'blazej',
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

put();
