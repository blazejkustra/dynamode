import { CreateTableCommandInput } from '@aws-sdk/client-dynamodb';

import { ddb } from './setup';

async function createUserTable() {
  const input: CreateTableCommandInput = {
    TableName: 'users',
    KeySchema: [
      {
        AttributeName: 'partitionKey',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'sortKey',
        KeyType: 'RANGE',
      },
    ],
    BillingMode: 'PROVISIONED',
    AttributeDefinitions: [
      {
        AttributeName: 'partitionKey',
        AttributeType: 'S',
      },
      {
        AttributeName: 'sortKey',
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
