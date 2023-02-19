import { reservedWordManager } from '../model';

async function deleteFn() {
  const entityReservedWordDelete = await reservedWordManager.delete({ COLUMN: 'pk1', OBJECT: 'sk1' });

  console.log();
  console.log('OUTPUT:');
  console.log(entityReservedWordDelete);
}

deleteFn();
