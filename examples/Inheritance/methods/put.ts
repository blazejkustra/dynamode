import { EntityOne, EntityThree, EntityTwo } from '../model';

async function put() {
  const item1 = await EntityOne.put(
    new EntityOne({
      propPk: 'propPk',
      propSk: 101,
      index: 'index',
      one: { test: 2 },
    }),
  );
  const item2 = await EntityTwo.put(
    new EntityTwo({
      propPk: 'propPk',
      propSk: 102,
      index: 'index',
      one: { test: 2 },
      two: { test: '2' },
    }),
  );
  const item3 = await EntityThree.put(
    new EntityThree({
      propPk: 'propPk',
      propSk: 103,
      index: 'index',
      otherProperty: { test: 2 },
    }),
  );

  console.log();
  console.log('OUTPUT:');
  console.log(item1);
  console.log(item2);
  console.log(item3);
}

put();
