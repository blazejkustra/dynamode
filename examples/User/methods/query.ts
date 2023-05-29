import { UserManager } from '../model';

async function query() {
  const result = await UserManager.query()
    .partitionKey('partitionKey')
    .eq('1')
    .sortKey('sortKey')
    .beginsWith('bla')
    .limit(1)
    .sort('descending')
    .run({ return: 'output' });

  console.log();
  console.log('OUTPUT:');
  console.log(result);
}

query();
