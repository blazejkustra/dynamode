import { reservedWordManager } from '../model';

async function get() {
  const userGet = await reservedWordManager.get({ COLUMN: 'pk1', OBJECT: 'sk1' });

  console.log();
  console.log('OUTPUT:');
  console.log(userGet);
}

get();
