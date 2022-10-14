import { AllPossibleProperties } from '../model';

async function query() {
  const userQuery = await AllPossibleProperties.query()
    .partitionKey('partitionKey')
    .eq('pk1')
    .condition(AllPossibleProperties.condition().attribute('number').le(2).or.parenthesis(AllPossibleProperties.condition().attribute('GSI_1_PK').not().eq('user').and.attribute('string').beginsWith('kustra.blazej')))
    .run();

  console.log();
  console.log('OUTPUT:');
  console.log(userQuery);
}

query();
