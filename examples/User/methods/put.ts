import { User } from '../User';

async function put() {
  const user = await User.put(
    new User({
      PK: 'pk1',
      SK: 'sk1',
      string: 'kustra.blazej@gmail.com',
      LSI_1_SK: 105,
      object: { optional: 'test', required: 2 },
      set: new Set('123'),
      array: ['1'],
      number: 10,
      map: new Map<string, string>([['1', 'test']]),
      boolean: true,
      username: 'username2',
    }),
  );

  console.log();
  console.log('OUTPUT:');
  console.log(user);
}

put();
