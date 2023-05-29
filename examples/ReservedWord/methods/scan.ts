import { ReservedWordManager } from '../model';

async function scan() {
  const entityReservedWordScan = await ReservedWordManager.scan()
    .attribute('COLUMN')
    .beginsWith('pk')
    .startAt({ OBJECT: 'sk1', COLUMN: 'pk1' })
    .limit(1)
    .run();

  console.log();
  console.log('OUTPUT:');
  console.log(entityReservedWordScan);
}

scan();
