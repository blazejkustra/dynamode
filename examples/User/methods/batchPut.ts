import { User } from '../User';

async function batchPut() {
  const userBatchPut = await User.batchPut([
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
    new User({
      PK: 'pk2',
      SK: 'sk2',
      string: 'kustra.blazej@gmail.com',
      object: { optional: 'test', required: 2 },
      set: new Set('123'),
      array: ['1'],
      number: 10,
      map: new Map<string, string>([['1', 'test']]),
      boolean: true,
    }),
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(userBatchPut);
}

batchPut();
