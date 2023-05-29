import { UserManager } from '../model';

async function scan() {
  const result = await UserManager.scan()
    .attribute('age')
    .eq(18)
    .attribute('partitionKey')
    .beginsWith('1')
    .limit(3)
    .run({ return: 'output' });

  console.log();
  console.log('OUTPUT:');
  console.log(result);
}

scan();
