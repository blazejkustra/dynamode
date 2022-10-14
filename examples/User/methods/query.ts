import { User } from '../User';

async function query() {
  const userQuery = await User.query()
    .partitionKey('partitionKey')
    .eq('pk1')
    .condition(User.condition().attribute('age').ge(18).or.parenthesis(User.condition().attribute('partitionKey').not().eq('user').and.attribute('age').between(18, 23)))
    .run();

  console.log();
  console.log('OUTPUT:');
  console.log(userQuery);
}

query();
