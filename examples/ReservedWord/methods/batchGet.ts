import { EntityReservedWord } from '../model';

async function batchGet() {
  const entityReservedWordBatchGet = await EntityReservedWord.batchGet([
    { COLUMN: 'pk1', OBJECT: 'sk1' },
    { COLUMN: 'pk2', OBJECT: 'sk2' },
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(entityReservedWordBatchGet);
}

batchGet();
