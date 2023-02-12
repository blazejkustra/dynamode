import { EntityReservedWordRegistry } from './../model';

async function batchDelete() {
  const entityReservedWordBatchDelete = await EntityReservedWordRegistry.batchDelete([
    { COLUMN: 'pk1', OBJECT: 'sk1' },
    { COLUMN: 'pk2', OBJECT: 'sk2' },
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(entityReservedWordBatchDelete);
}

batchDelete();
