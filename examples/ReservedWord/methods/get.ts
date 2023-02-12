import { EntityReservedWordRegistry } from '../model';

async function get() {
  const userGet = await EntityReservedWordRegistry.get({ COLUMN: 'pk1', OBJECT: 'sk1' });

  console.log();
  console.log('OUTPUT:');
  console.log(userGet);
}

get();
