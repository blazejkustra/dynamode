import transactionWrite from '../../../dist/transactionWrite';
import { EntityReservedWord, ReservedWordManager } from '../model';

async function transaction() {
  const transactions = await transactionWrite(
    [
      ReservedWordManager.transaction.update(
        { COLUMN: 'pk1', OBJECT: 'sk1' },
        {
          add: {
            DEFAULT: 10,
          },
        },
      ),
      ReservedWordManager.transaction.put(
        new EntityReservedWord({
          COLUMN: 'pk2',
          OBJECT: 'sk2',
          COPY: 'copy',
          DEFAULT: 105,
          old: 105,
        }),
      ),
      ReservedWordManager.transaction.create(
        new EntityReservedWord({
          COLUMN: 'pk3',
          OBJECT: 'sk3',
          COPY: 'copy',
          DEFAULT: 105,
          old: 105,
        }),
      ),
      ReservedWordManager.transaction.delete({ COLUMN: 'pk5', OBJECT: 'sk5' }),
      ReservedWordManager.transaction.condition(
        { COLUMN: 'pk6', OBJECT: 'sk6' },
        ReservedWordManager.condition().attribute('COLUMN').not().exists(),
      ),
    ],
    { return: 'default' },
  );

  console.log();
  console.log('OUTPUT:');
  console.log(transactions);
}

transaction();
