import { transactionWrite } from '../../../dist';
import { AllPossibleProperties, AllPossiblePropertiesRegistry } from '../model';

async function transaction() {
  const transactions = await transactionWrite(
    [
      AllPossiblePropertiesRegistry.transaction.update(
        { partitionKey: 'pk1', sortKey: 'sk1' },
        {
          add: {
            set: new Set(['5']),
          },
        },
        {
          condition: AllPossiblePropertiesRegistry.condition().attribute('partitionKey').eq('pk1'),
        },
      ),
      AllPossiblePropertiesRegistry.transaction.put(
        new AllPossibleProperties({
          partitionKey: 'pk2',
          sortKey: 'sk2',
          string: 'kustra.blazej@gmail.com',
          LSI_1_SK: 105,
          object: { optional: 'test', required: 2 },
          set: new Set('123'),
          array: ['1'],
          number: 10,
          map: new Map<string, string>([['1', 'test']]),
          boolean: true,
        }),
      ),
      AllPossiblePropertiesRegistry.transaction.create(
        new AllPossibleProperties({
          partitionKey: 'pk3',
          sortKey: 'sk3',
          string: 'kustra.blazej@gmail.com',
          LSI_1_SK: 105,
          object: { optional: 'test', required: 2 },
          set: new Set('123'),
          array: ['1'],
          number: 10,
          map: new Map<string, string>([['1', 'test']]),
          boolean: true,
        }),
      ),
      AllPossiblePropertiesRegistry.transaction.delete({
        partitionKey: 'pk2',
        sortKey: 'sk2',
      }),
      AllPossiblePropertiesRegistry.transaction.condition(
        { partitionKey: 'pk1', sortKey: 'sk1' },
        AllPossiblePropertiesRegistry.condition().attribute('partitionKey').eq('pk1'),
      ),
    ],
    { return: 'default' },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
