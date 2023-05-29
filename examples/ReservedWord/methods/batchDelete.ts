import { ReservedWordManager } from '../model';

async function batchDelete() {
  const entityReservedWordBatchDelete = await ReservedWordManager.batchDelete([
    { COLUMN: 'pk1', OBJECT: 'sk1' },
    { COLUMN: 'pk2', OBJECT: 'sk2' },
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(entityReservedWordBatchDelete);
}

batchDelete();
