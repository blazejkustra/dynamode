import { User } from '../model';

async function query() {
  const userQuery = await User.query().partitionKey('partitionKey').eq('pk1').sortKey('sortKey').between('2', '2').run();

  console.log();
  console.log('OUTPUT:');
  console.log(userQuery);
}

query();
