import { AllPossibleProperties, AllPossiblePropertiesRegistry } from '../model';

async function create() {
  const item = await AllPossiblePropertiesRegistry.create(
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
  );

  console.log();
  console.log('OUTPUT:');
  console.log(item);
}

create();
