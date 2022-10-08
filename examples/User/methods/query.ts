import { User } from '../User';

async function query() {
  const userQuery = await User.query()
    .partitionKey('PK')
    .eq('pk1')
    .condition(User.condition().attribute('number').le(2).or.parenthesis(User.condition().attribute('GSI_1_PK').not().eq('user').and.attribute('string').beginsWith('kustra.blazej')))
    .run();

  console.log();
  console.log('OUTPUT:');
  console.log(userQuery);
}

query();
