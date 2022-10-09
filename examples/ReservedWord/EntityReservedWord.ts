import { Entity } from '../../dist';
import { createdAt, gsiPartitionKey, gsiSortKey, lsiSortKey, primaryPartitionKey, primarySortKey, updatedAt } from '../../dist/decorators';
import { ddb } from '../utils/setup';

const USERS_TABLE = 'reservedWord';

type ReservedWordKeys = {
  partitionKey: 'COLUMN';
  sortKey: 'OBJECT';
  indexes: {
    OTHER: {
      partitionKey: 'COPY';
      sortKey: 'DEFAULT';
    };
    PRIMARY: {
      sortKey: 'old';
    };
  };
};

type ReservedWordProps = {
  COLUMN: string;
  OBJECT: string;
  COPY: string;
  DEFAULT?: number;
  old?: number;
  DAY?: Date;
  DATE?: Date;
};

export class EntityReservedWord extends Entity<ReservedWordKeys>({ ddb, tableName: USERS_TABLE }) {
  // Primary key
  @primaryPartitionKey(String)
  COLUMN: string;

  @primarySortKey(String)
  OBJECT: string;

  // Indexes
  @gsiPartitionKey(String, 'OTHER')
  COPY?: string;

  @gsiSortKey(Number, 'OTHER')
  DEFAULT?: number;

  @lsiSortKey(Number, 'PRIMARY')
  old?: number;

  // Timestamps
  @createdAt(String)
  DAY: Date;

  @updatedAt(Number)
  DATE: Date;

  constructor(props: ReservedWordProps) {
    super();
    // Primary key
    this.COLUMN = props.COLUMN;
    this.OBJECT = props.OBJECT;

    // Indexes
    this.COPY = props.COPY;
    this.DEFAULT = props.DEFAULT;
    this.old = props.old;

    // Timestamps
    this.DAY = props.DAY || new Date();
    this.DATE = props.DATE || new Date();
  }
}
