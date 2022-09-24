import { User } from '../User';

async function update() {
  const userUpdate = await User.update(
    { PK: 'pk1', SK: 'sk1' },
    {
      add: {
        set: new Set(['5']),
      },
      // set: {
      //   string: 'string',
      // },
      // setIfNotExists: {
      //   'object.optional': 'optional',
      // },
      // listAppend: {
      //   array: ['value'],
      // },
      // increment: {
      //   number: 10,
      // },
      // decrement: {
      //   'object.required': 2,
      // },
      // delete: {
      //   set: new Set(['2', '5']),
      // },
      // remove: ['object.optional'],
    },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(userUpdate);
}

update();
