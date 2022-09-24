import { CreateTableCommandInput } from '@aws-sdk/client-dynamodb';

import { ddb } from '../setup';

async function createCreateTableInput() {
  const input: CreateTableCommandInput = {
    TableName: 'users',
    KeySchema: [
      {
        AttributeName: 'PK',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'SK',
        KeyType: 'RANGE',
      },
    ],
    BillingMode: 'PROVISIONED',
    AttributeDefinitions: [
      {
        AttributeName: 'PK',
        AttributeType: 'S',
      },
      {
        AttributeName: 'SK',
        AttributeType: 'S',
      },
      {
        AttributeName: 'GSI_1_PK',
        AttributeType: 'S',
      },
      {
        AttributeName: 'GSI_1_SK',
        AttributeType: 'N',
      },
      {
        AttributeName: 'LSI_1_SK',
        AttributeType: 'N',
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
    LocalSecondaryIndexes: [
      {
        IndexName: 'LSI_1_NAME',
        KeySchema: [
          {
            AttributeName: 'PK',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'LSI_1_SK',
            KeyType: 'RANGE',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
      },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI_1_NAME',
        KeySchema: [
          {
            AttributeName: 'GSI_1_PK',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'GSI_1_SK',
            KeyType: 'RANGE',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      },
    ],
  };
  const createTableOutput = await ddb.createTable(input);
  console.log(createTableOutput);
}
createCreateTableInput();
