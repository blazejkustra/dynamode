import { AllPossiblePropertiesRegistry } from '../model';

async function get() {
  const modelGet = await AllPossiblePropertiesRegistry.get({ partitionKey: 'pk1', sortKey: 'sk1' });

  console.log();
  console.log('OUTPUT:');
  console.log(modelGet);
}

get();
