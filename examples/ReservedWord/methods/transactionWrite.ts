import { transactionWrite } from '../../../dist';
import { EntityReservedWord } from '../model';

async function transaction() {
  const transactions = await transactionWrite(
    [
      EntityReservedWord.transactionUpdate(
        { COLUMN: 'pk1', OBJECT: 'sk1' },
        {
          add: {
            DEFAULT: 10,
          },
        },
      ),
      EntityReservedWord.transactionPut(
        new EntityReservedWord({
          COLUMN: 'pk2',
          OBJECT: 'sk2',
          COPY: 'copy',
          DEFAULT: 105,
          old: 105,
        }),
      ),
      EntityReservedWord.transactionCreate(
        new EntityReservedWord({
          COLUMN: 'pk3',
          OBJECT: 'sk3',
          COPY: 'copy',
          DEFAULT: 105,
          old: 105,
        }),
      ),
      EntityReservedWord.transactionDelete({ COLUMN: 'pk5', OBJECT: 'sk5' }),
      EntityReservedWord.transactionCondition({ COLUMN: 'pk6', OBJECT: 'sk6' }, EntityReservedWord.condition().attribute('COLUMN').not().exists()),
    ],
    { return: 'default' },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
