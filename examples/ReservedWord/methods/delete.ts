import { EntityReservedWord } from '../model';

async function deleteFn() {
  const entityReservedWordDelete = await EntityReservedWord.delete({ COLUMN: 'pk1', OBJECT: 'sk1' });

  console.log();
  console.log('OUTPUT:');
  console.log(entityReservedWordDelete);
}

deleteFn();
