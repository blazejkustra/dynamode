import { EntityOneManager, EntityThreeManager, EntityTwoManager } from '../model';

async function get() {
  const model1Get = await EntityOneManager.get({ propPk: 'propPk', propSk: 101 });
  const model2Get = await EntityTwoManager.get({ propPk: 'propPk', propSk: 102 });
  const model3Get = await EntityThreeManager.get({ propPk: 'propPk', propSk: 103 });

  console.log();
  console.log('OUTPUT:');
  console.log(model1Get);
  console.log(model2Get);
  console.log(model3Get);
}

get();
