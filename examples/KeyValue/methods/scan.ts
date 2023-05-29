import { KeyValueManager } from '../model';

async function scan() {
  const userScan = await KeyValueManager.scan().attribute('key').beginsWith('k').run();

  console.log();
  console.log('OUTPUT:');
  console.log(userScan);
}

scan();
