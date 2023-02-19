import { reservedWordManager } from '../model';

async function update() {
  const entityReservedWordUpdate = await reservedWordManager.update(
    { COLUMN: 'pk1', OBJECT: 'sk1' },
    {
      add: {
        DEFAULT: 10,
      },
    },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(entityReservedWordUpdate);
}

update();
