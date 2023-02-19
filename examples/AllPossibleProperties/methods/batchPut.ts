import { AllPossibleProperties, AllPossiblePropertiesManager } from '../model';

async function batchPut() {
  const modelBatchPut = await AllPossiblePropertiesManager.batchPut([
    new AllPossibleProperties({
      partitionKey: 'pk1',
      sortKey: 'sk1',
      string: 'kustra.blazej@gmail.com',
      object: { optional: 'test', required: 2 },
      set: new Set('123'),
      array: ['1'],
      number: 10,
      map: new Map<string, string>([['1', 'test']]),
      boolean: true,
    }),
    new AllPossibleProperties({
      partitionKey: 'pk2',
      sortKey: 'sk2',
      string: 'kustra.blazej@gmail.com',
      object: { optional: 'test', required: 2 },
      set: new Set('123'),
      array: ['1'],
      number: 10,
      map: new Map<string, string>([['1', 'test']]),
      boolean: true,
    }),
  ]);

  console.log();
  console.log('OUTPUT:');
  console.log(modelBatchPut);
}

batchPut();
