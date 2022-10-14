import { transactionWrite } from '../../../dist';
import { AllPossibleProperties } from '../model';

async function transaction() {
  const transactions = await transactionWrite(
    [
      AllPossibleProperties.transactionUpdate(
        { partitionKey: 'pk1', sortKey: 'sk1' },
        {
          add: {
            set: new Set(['5']),
          },
        },
        { condition: AllPossibleProperties.condition().attribute('partitionKey').eq('pk1') },
      ),
      AllPossibleProperties.transactionPut(
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
      AllPossibleProperties.transactionCreate(
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
      AllPossibleProperties.transactionDelete({ partitionKey: 'pk2', sortKey: 'sk2' }),
      AllPossibleProperties.transactionCondition({ partitionKey: 'pk1', sortKey: 'sk1' }, AllPossibleProperties.condition().attribute('partitionKey').eq('pk1')),
    ],
    { return: 'default' },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
