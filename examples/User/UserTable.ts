import { createdAt, gsiPartitionKey, gsiSortKey, lsiSortKey, primaryPartitionKey, primarySortKey, updatedAt } from '../../dist/decorators';
import { Entity } from '../../dist/Entity';

import { ddb } from './setup';

const USERS_TABLE = 'users';
// @tableName(USERS_TABLE)
// @dynamoInstance(ddb)

type UserTableKeys = {
  partitionKey: 'PK';
  sortKey: 'SK';
  indexes: {
    GSI_1_NAME: {
      partitionKey: 'GSI_1_PK';
      sortKey: 'GSI_1_SK';
    };
    LSI_1_NAME: {
      sortKey: 'LSI_1_SK';
    };
  };
};

export type UserTableProps = {
  PK: string;
  SK: string;
  GSI_1_PK?: string;
  GSI_1_SK?: number;
  LSI_1_SK?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export class UserTable extends Entity<UserTableKeys>({ ddb, tableName: USERS_TABLE }) {
  // Primary key
  @primaryPartitionKey(String)
  PK: string;

  @primarySortKey(String)
  SK: string;

  // Indexes
  @gsiPartitionKey(String, 'GSI_1_NAME')
  GSI_1_PK?: string;

  @gsiSortKey(Number, 'GSI_1_NAME')
  GSI_1_SK?: number;

  @lsiSortKey(Number, 'LSI_1_NAME')
  LSI_1_SK?: number;

  // Timestamps
  @createdAt(String)
  createdAt: Date;

  @updatedAt(Number)
  updatedAt: Date;

  constructor(props: UserTableProps) {
    super();
    // Primary key
    this.PK = props.PK;
    this.SK = props.SK;

    // Indexes
    this.GSI_1_PK = props.GSI_1_PK;
    this.GSI_1_SK = props.GSI_1_SK;
    this.LSI_1_SK = props.LSI_1_SK;

    // Timestamps
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
