import { AllPossiblePropertiesRegistry } from '../model';

async function scan() {
  const userScan = await AllPossiblePropertiesRegistry.scan().attribute('string').beginsWith('k').startAt({ sortKey: 'user', partitionKey: 'pk3' }).indexName('GSI_1_NAME').run();

  console.log();
  console.log('OUTPUT:');
  console.log(userScan);
}

scan();
