import { TableDescription } from '@aws-sdk/client-dynamodb';

export const tableMetadata = {
  tableName: 'TableName',
  partitionKey: 'PK',
  indexes: {
    LSI: {
      sortKey: 'LSI_SK',
    },
    GSI: {
      partitionKey: 'GSI_PK',
    },
  },
};

export const validTableDescription = {
  TableName: 'TableName',
  TableStatus: 'Active',
  CreationDateTime: new Date(),
  AttributeDefinitions: [{ AttributeName: 'PK', AttributeType: 'String' }],
  KeySchema: [{ AttributeName: 'PK', KeyType: 'HASH' }],
  ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  TableSizeBytes: 10,
  ItemCount: 1,
  TableArn: 'TableArn',
  TableId: 'TableId',
  BillingModeSummary: { BillingMode: 'BillingMode' },
  LocalSecondaryIndexes: [
    {
      IndexName: 'LSI',
      KeySchema: [{ AttributeName: 'LSI_SK', KeyType: 'RANGE' }],
      IndexSizeBytes: 1,
      ItemCount: 1,
      IndexArn: 'IndexArn',
    },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'GSI',
      KeySchema: [{ AttributeName: 'GSI_PK', KeyType: 'HASH' }],
      IndexSizeBytes: 1,
      ItemCount: 1,
      IndexArn: 'IndexArn',
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    },
  ],
  StreamSpecification: { StreamEnabled: true, StreamViewType: 'StreamViewType' },
  LatestStreamLabel: 'LatestStreamLabel',
  LatestStreamArn: 'LatestStreamArn',
  GlobalTableVersion: '2020.12.11',
  Replicas: [{ RegionName: 'RegionName' }],
  RestoreSummary: {
    SourceBackupArn: 'SourceBackupArn',
    SourceTableArn: 'SourceTableArn',
    RestoreDateTime: new Date(),
    RestoreInProgress: false,
  },
  SSEDescription: { Status: 'Status', SSEType: 'SSEType', KMSMasterKeyArn: 'KMSMasterKeyArn' },
  ArchivalSummary: {
    ArchivalDateTime: new Date(),
    ArchivalReason: 'ArchivalReason',
    ArchivalBackupArn: 'ArchivalBackupArn',
  },
  TableClassSummary: { TableClass: 'TableClass' },
  DeletionProtectionEnabled: false,
} satisfies TableDescription;
