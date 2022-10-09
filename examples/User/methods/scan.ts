import { User } from '../User';

async function scan() {
  const userScan = await User.scan().attribute('string').beginsWith('k').startAt({ SK: 'user', PK: 'pk3' }).indexName('GSI_1_NAME').run();

  console.log();
  console.log('OUTPUT:');
  console.log(userScan);
}

scan();
