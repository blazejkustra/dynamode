import { CreateTableCommandInput } from '@aws-sdk/client-dynamodb';

import { ddb } from './setup';

async function createAllPossiblePropertiesTable() {
  const input: CreateTableCommandInput = {
    TableName: 'inheritance',
    KeySchema: [
      {
        AttributeName: 'propPk',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'propSk',
        KeyType: 'RANGE',
      },
    ],
    BillingMode: 'PROVISIONED',
    AttributeDefinitions: [
      {
        AttributeName: 'propPk',
        AttributeType: 'S',
      },
      {
        AttributeName: 'propSk',
        AttributeType: 'N',
      },
      {
        AttributeName: 'index',
        AttributeType: 'S',
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
    LocalSecondaryIndexes: [
      {
        IndexName: 'LSI_NAME',
        KeySchema: [
          {
            AttributeName: 'propPk',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'index',
            KeyType: 'RANGE',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
      },
    ],
  };
  const createTableOutput = await ddb.createTable(input);
  console.log(createTableOutput);
}

createAllPossiblePropertiesTable();
