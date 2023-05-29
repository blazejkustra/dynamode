import { ReservedWordManager } from '../model';

async function query() {
  const entityReservedWordQuery = await ReservedWordManager.query()
    .partitionKey('COLUMN')
    .eq('pk1')
    .attributes(['old'])
    .run({ return: 'input' });

  console.log();
  console.log('OUTPUT:');
  console.log(entityReservedWordQuery);
}

query();
