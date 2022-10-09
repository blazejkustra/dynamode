import { EntityReservedWord } from '../EntityReservedWord';

async function query() {
  const entityReservedWordQuery = await EntityReservedWord.query().partitionKey('COLUMN').eq('pk1').run();

  console.log();
  console.log('OUTPUT:');
  console.log(entityReservedWordQuery);
}

query();
