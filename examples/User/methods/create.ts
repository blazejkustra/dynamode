import { User } from '../User';

async function create() {
  const user = await User.create(
    new User({
      PK: 'pk1',
      SK: 'sk1',
      string: 'kustra.blazej@gmail.com',
      object: { optional: 'test', required: 2 },
      set: new Set('123'),
      array: ['1'],
      number: 10,
      map: new Map<string, string>([['1', 'test']]),
      boolean: true,
    }),
  );

  console.log();
  console.log('OUTPUT:');
  console.log(user);
}

create();
