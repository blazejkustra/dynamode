import { Entity } from '../../dist';
import { attribute, createdAt, gsiPartitionKey, gsiSortKey, lsiSortKey, prefix, primaryPartitionKey, primarySortKey, register, updatedAt } from '../../dist/decorators';

import { ddb } from './setup';

type AllPossiblePropertiesKeys = {
  partitionKey: 'partitionKey';
  sortKey: 'sortKey';
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

type AllPossiblePropertiesProps = {
  partitionKey: string;
  sortKey: string;
  GSI_1_PK?: string;
  GSI_1_SK?: number;
  LSI_1_SK?: number;
  createdAt?: Date;
  updatedAt?: Date;

  string: string;
  object: {
    optional?: string;
    required: number;
  };
  array: string[];
  map: Map<string, string>;
  set: Set<string>;
  number?: number;
  boolean: boolean;
};

const TABLE_NAME = 'all-possible-properties';
const PREFIX = 'prefix';

@register(ddb)
export class AllPossibleProperties extends Entity<AllPossiblePropertiesKeys>(TABLE_NAME) {
  // Primary key
  @prefix(PREFIX)
  @primaryPartitionKey(String)
  partitionKey: string;

  @primarySortKey(String)
  sortKey: string;

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

  @attribute(String)
  string: string;

  @attribute(Object)
  object: {
    optional?: string;
    required: number;
  };

  @attribute(Array)
  array?: string[];

  @attribute(Map)
  map: Map<string, string>;

  @attribute(Set)
  set: Set<string>;

  @attribute(Number)
  number?: number;

  @attribute(Boolean)
  boolean: boolean;

  unsaved: string;

  constructor(props: AllPossiblePropertiesProps) {
    super();

    // Primary key
    this.partitionKey = props.partitionKey;
    this.sortKey = props.sortKey;

    // Indexes
    this.GSI_1_PK = props.GSI_1_PK;
    this.GSI_1_SK = props.GSI_1_SK;
    this.LSI_1_SK = props.LSI_1_SK;

    // Timestamps
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();

    this.string = props.string;
    this.object = props.object;
    this.array = props.array;
    this.map = props.map;
    this.set = props.set;
    this.number = props.number;
    this.boolean = props.boolean;
    this.unsaved = 'unsaved';
  }

  public method() {
    console.log('method');
  }

  public static staticMethod() {
    console.log('staticMethod');
  }
}
