import { EntityReservedWord, ReservedWordManager } from '../model';

async function batchPut() {
  const entityReservedWordBatchPut = await ReservedWordManager.batchPut([
    new EntityReservedWord({
      COLUMN: 'pk1',
      OBJECT: 'sk1',
      COPY: 'copy',
      DEFAULT: 105,
      old: 105,
    }),
    new EntityReservedWord({
      COLUMN: 'pk2',
      OBJECT: 'sk2',
      COPY: 'copy',
      DEFAULT: 105,
      old: 105,
    }),
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(entityReservedWordBatchPut);
}

batchPut();
