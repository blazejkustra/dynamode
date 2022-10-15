import { User } from '../model';

async function scan() {
  const userScan = await User.scan().attribute('age').eq(18).run();

  console.log();
  console.log('OUTPUT:');
  console.log(userScan);
}

scan();
