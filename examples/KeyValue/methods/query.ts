import { KeyValueManager } from '../model';

async function query() {
  const userQuery = await KeyValueManager.query().partitionKey('key').eq('key1').run();

  console.log();
  console.log('OUTPUT:');
  console.log(userQuery);
}

query();
