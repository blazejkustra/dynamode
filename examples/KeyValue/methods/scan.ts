import { KeyValue } from '../model';

async function scan() {
  const userScan = await KeyValue.scan().attribute('key').beginsWith('k').run();

  console.log();
  console.log('OUTPUT:');
  console.log(userScan);
}

scan();
