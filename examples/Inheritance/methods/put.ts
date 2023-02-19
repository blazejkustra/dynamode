import { EntityOne, EntityOneManager, EntityThree, EntityThreeManager, EntityTwo, EntityTwoManager } from '../model';

async function put() {
  const item1 = await EntityOneManager.put(
    new EntityOne({
      propPk: 'propPk',
      propSk: 101,
      index: 'index',
      one: { test: 2 },
    }),
  );
  const item2 = await EntityTwoManager.put(
    new EntityTwo({
      propPk: 'propPk',
      propSk: 102,
      index: 'index',
      one: { test: 2 },
      two: { test: '2' },
    }),
  );
  const item3 = await EntityThreeManager.put(
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
