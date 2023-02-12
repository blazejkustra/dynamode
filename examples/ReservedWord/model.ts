import { createdAt, gsiPartitionKey, gsiSortKey, lsiSortKey, primaryPartitionKey, primarySortKey, updatedAt } from '../../dist/decorators';
import { Entity, register } from '../../dist/entity';

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

const TABLE_NAME = 'reservedWord';

// @register(ddb)
export class EntityReservedWord extends Entity {
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

export const EntityReservedWordRegistry = register<ReservedWordKeys, typeof EntityReservedWord>(EntityReservedWord, TABLE_NAME);
