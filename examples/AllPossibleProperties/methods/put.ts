import { AllPossibleProperties, AllPossiblePropertiesRegistry } from '../model';

async function put() {
  const item = await AllPossiblePropertiesRegistry.put(
    new AllPossibleProperties({
      partitionKey: 'pk1',
      sortKey: 'sk1',
      string: 'kustra.blazej@gmail.com',
      LSI_1_SK: 105,
      object: { optional: 'test', required: 2 },
      set: new Set('123'),
      array: ['1'],
      number: 10,
      map: new Map<string, string>([['1', 'test']]),
      boolean: true,
    }),
  );

  console.log();
  console.log('OUTPUT:');
  console.log(item);
}

put();
