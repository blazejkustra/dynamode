import { User } from '../User';

async function scan() {
  const userScan = await User.scan().filter('string').beginsWith('k').startAt({ SK: 'user', PK: 'pk3' }).run();

  console.log();
  console.log('OUTPUT:');
  console.log(userScan);
}

scan();
