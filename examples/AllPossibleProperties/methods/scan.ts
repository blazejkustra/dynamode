import { AllPossiblePropertiesManager } from '../model';

async function scan() {
  const scan1 = await AllPossiblePropertiesManager.scan()
    .attribute('string')
    .beginsWith('k')
    .indexName('GSI_1_NAME')
    .limit(1)
    .run();

  const scan2 = await AllPossiblePropertiesManager.scan()
    .attribute('string')
    .beginsWith('k')
    .startAt(scan1.lastKey)
    .indexName('GSI_1_NAME')
    .run();

  console.log();
  console.log('OUTPUT:');
  console.log(scan1);
  console.log(scan2);
}

scan();
