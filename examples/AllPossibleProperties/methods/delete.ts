import { AllPossiblePropertiesManager } from '../model';

async function deleteFn() {
  const modelDelete = await AllPossiblePropertiesManager.delete({ partitionKey: 'pk1', sortKey: 'sk1' });

  console.log();
  console.log('OUTPUT:');
  console.log(modelDelete);
}

deleteFn();
