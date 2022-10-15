import { EntityOne, EntityThree, EntityTwo } from '../model';

async function get() {
  const model1Get = await EntityOne.get({ propPk: 'propPk', propSk: 101 });
  const model2Get = await EntityTwo.get({ propPk: 'propPk', propSk: 102 });
  const model3Get = await EntityThree.get({ propPk: 'propPk', propSk: 103 });

  console.log();
  console.log('OUTPUT:');
  console.log(model1Get);
  console.log(model2Get);
  console.log(model3Get);
}

get();
