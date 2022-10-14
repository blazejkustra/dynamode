import { User } from '../User';

async function put() {
  const user = await User.put(
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

put();
