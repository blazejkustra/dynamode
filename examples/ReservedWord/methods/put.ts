import { EntityReservedWord } from '../EntityReservedWord';

async function put() {
  const entityReservedWord = await EntityReservedWord.put(
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

put();
