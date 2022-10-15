import { CreateTableCommandInput } from '@aws-sdk/client-dynamodb';

import { ddb } from './setup';

async function createUserTable() {
  const input: CreateTableCommandInput = {
    TableName: 'key-value',
    KeySchema: [
      {
        AttributeName: 'key',
        KeyType: 'HASH',
      },
    ],
    BillingMode: 'PROVISIONED',
    AttributeDefinitions: [
      {
        AttributeName: 'key',
        AttributeType: 'S',
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  };
  const createTableOutput = await ddb.createTable(input);
  console.log(createTableOutput);
}

createUserTable();
