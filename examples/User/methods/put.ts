import { User } from '../User';

async function put() {
  const user = User.put(
    new User({
      PK: 'pkk',
      SK: 'skkk',
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

put();
