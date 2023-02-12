import { AllPossiblePropertiesRegistry } from '../model';

async function batchDelete() {
  const modelBatchDelete = await AllPossiblePropertiesRegistry.batchDelete(
    [
      { partitionKey: 'pk1', sortKey: 'sk1' },
      { partitionKey: 'pk2', sortKey: 'sk2' },
    ],
    { return: 'default' },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(modelBatchDelete);
}

batchDelete();
