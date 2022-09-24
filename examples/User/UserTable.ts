import { column, createdAt, gsiPartitionKey, gsiSortKey, lsiSortKey, primaryPartitionKey, primarySortKey, updatedAt } from '../../dist/decorators';
import { Entity } from '../../dist/Entity';
import { Table } from '../../dist/Table';
import { Optional } from '../../dist/utils/types';

import { ddb } from './setup';

export type UserTablePrimaryKey = { PK: string; SK: string };
export type UserTableProps = Optional<UserTable, 'createdAt' | 'updatedAt'>;

const tableName = 'users';
export class UserTable extends Table<UserTablePrimaryKey>({ ddb, tableName }) {
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

export type UserTableEntityProps = Optional<UserTableEntity, 'additional' | 'dynamodeObject' | 'createdAt' | 'updatedAt'>;

export class UserTableEntity extends Entity(UserTable) {
  @column(String)
  username: string;

  additional: string;

  constructor(props: UserTableEntityProps) {
    super(props);

    // columns
    this.username = props.username;
    this.additional = "Some additional field that won't be saved in dynamoDB";
  }
}
