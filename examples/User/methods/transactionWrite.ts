import { transactionWrite } from '../../../dist';
import { User } from '../User';

import { UserConfig } from './../UserConfig';

async function transaction() {
  const transactions = await transactionWrite(
    [
      User.transactionUpdate(
        { PK: 'pk1', SK: 'sk1' },
        {
          add: {
            set: new Set(['5']),
          },
        },
        { condition: User.condition().attribute('PK').eq('pk1') },
      ),
      User.transactionPut(
        new User({
          PK: 'pk2',
          SK: 'sk2',
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
      User.transactionCreate(
        new User({
          PK: 'pk3',
          SK: 'sk3',
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
      UserConfig.transactionDelete({ PK: 'pk2', SK: 'sk2' }),
      UserConfig.transactionCondition({ PK: 'pk1', SK: 'sk1' }, UserConfig.condition().attribute('PK').eq('pk1')),
    ],
    { return: 'default' },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
