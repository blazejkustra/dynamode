import { transactionWrite } from '../../../dist';
import { EntityReservedWord, EntityReservedWordRegistry } from '../model';

async function transaction() {
  const transactions = await transactionWrite(
    [
      EntityReservedWordRegistry.transactionUpdate(
        { COLUMN: 'pk1', OBJECT: 'sk1' },
        {
          add: {
            DEFAULT: 10,
          },
        },
      ),
      EntityReservedWordRegistry.transactionPut(
        new EntityReservedWord({
          COLUMN: 'pk2',
          OBJECT: 'sk2',
          COPY: 'copy',
          DEFAULT: 105,
          old: 105,
        }),
      ),
      EntityReservedWordRegistry.transactionCreate(
        new EntityReservedWord({
          COLUMN: 'pk3',
          OBJECT: 'sk3',
          COPY: 'copy',
          DEFAULT: 105,
          old: 105,
        }),
      ),
      EntityReservedWordRegistry.transactionDelete({ COLUMN: 'pk5', OBJECT: 'sk5' }),
      EntityReservedWordRegistry.transactionCondition({ COLUMN: 'pk6', OBJECT: 'sk6' }, EntityReservedWordRegistry.condition().attribute('COLUMN').not().exists()),
    ],
    { return: 'default' },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
