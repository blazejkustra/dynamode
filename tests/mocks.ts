import {
  attribute,
  createdAt,
  gsiPartitionKey,
  gsiSortKey,
  lsiSortKey,
  prefix,
  primaryPartitionKey,
  primarySortKey,
  updatedAt,
} from '@lib/decorators';
import { Dynamode } from '@lib/dynamode';
import { Entity, register } from '@lib/entity';

Dynamode.ddb.local();
export const ddb = Dynamode.ddb.get();

export type TestTableKeys = {
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

type TestTableProps = {
  partitionKey: string;
  sortKey: string;
  GSI_1_PK?: string;
  GSI_1_SK?: number;
  LSI_1_SK?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export const TEST_TABLE_NAME = 'test-table';
const PREFIX = 'prefix';

export class TestTable extends Entity {
  public static tableName = TEST_TABLE_NAME;

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

  constructor(props: TestTableProps) {
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
  }
}

export const testTableInstance = new TestTable({
  partitionKey: 'PK',
  sortKey: 'SK',
});

export type MockEntityProps = TestTableProps & {
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

export class MockEntity extends TestTable {
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

  constructor(props: MockEntityProps) {
    super(props);

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

export const MockEntityRegistry = register<TestTableKeys, typeof MockEntity>(MockEntity, TEST_TABLE_NAME);

export const mockInstance = new MockEntity({
  partitionKey: 'PK',
  sortKey: 'SK',
  string: 'string',
  object: {
    required: 2,
  },
  map: new Map([['1', '2']]),
  set: new Set(['1', '2', '3']),
  array: ['1', '2'],
  boolean: true,
});
