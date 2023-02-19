import { transactionWrite } from '../../../dist';
import { EntityReservedWord, reservedWordManager } from '../model';

async function transaction() {
  const transactions = await transactionWrite(
    [
      reservedWordManager.transactionUpdate(
        { COLUMN: 'pk1', OBJECT: 'sk1' },
        {
          add: {
            DEFAULT: 10,
          },
        },
      ),
      reservedWordManager.transactionPut(
        new EntityReservedWord({
          COLUMN: 'pk2',
          OBJECT: 'sk2',
          COPY: 'copy',
          DEFAULT: 105,
          old: 105,
        }),
      ),
      reservedWordManager.transactionCreate(
        new EntityReservedWord({
          COLUMN: 'pk3',
          OBJECT: 'sk3',
          COPY: 'copy',
          DEFAULT: 105,
          old: 105,
        }),
      ),
      reservedWordManager.transactionDelete({ COLUMN: 'pk5', OBJECT: 'sk5' }),
      reservedWordManager.transactionCondition(
        { COLUMN: 'pk6', OBJECT: 'sk6' },
        reservedWordManager.condition().attribute('COLUMN').not().exists(),
      ),
    ],
    { return: 'default' },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
