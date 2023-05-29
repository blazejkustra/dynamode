import { EntityReservedWord, ReservedWordManager } from '../model';

async function create() {
  const entityReservedWord = await ReservedWordManager.create(
    new EntityReservedWord({
      COLUMN: 'pk1',
      OBJECT: 'sk1',
      COPY: 'copy',
      DEFAULT: 105,
      old: 105,
    }),
  );

  console.log();
  console.log('OUTPUT:');
  console.log(entityReservedWord);
}

create();
