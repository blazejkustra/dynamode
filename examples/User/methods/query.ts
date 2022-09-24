import { User } from '../User';

async function query() {
  const userQuery = await User.query('GSI_1_PK', '').exec();

  console.log();
  console.log('OUTPUT:');
  console.log(userQuery);
}

query();
