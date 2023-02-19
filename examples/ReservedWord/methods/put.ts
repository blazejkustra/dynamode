import { EntityReservedWord, reservedWordManager } from '../model';

async function put() {
  const entityReservedWord = await reservedWordManager.put(
    new EntityReservedWord({
      COLUMN: 'pk3',
      OBJECT: 'sk3',
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
