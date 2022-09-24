import { User } from '../User';

async function update() {
  const userUpdate = await User.update(
    { PK: 'pk1', SK: 'maciej' },
    {
      add: {
        set: new Set(['5', '222']),
      },
      set: {
        string: 'test',
      },
      setIfNotExists: {
        set: new Set('2'),
      },
      listAppend: {
        array: ['value'],
      },
      increment: {
        number: 10,
      },
      decrement: {
        'object.required': 2,
      },
      delete: {
        set: new Set(['e', 'B']),
      },
      remove: ['number'],
    },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(userUpdate);
}

update();
