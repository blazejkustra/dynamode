import { vi } from 'vitest';

import attribute from '@lib/decorators';
import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import TableManager from '@lib/table';

vi.useFakeTimers();

export const mockDate = new Date(1000000000000);
vi.setSystemTime(mockDate);

Dynamode.ddb.local();
export const ddb = Dynamode.ddb.get();

type TestTableProps = {
  partitionKey: string;
  sortKey: string;
  GSI_1_PK?: string;
  GSI_2_PK?: string;
  GSI_SK?: number;
  LSI_1_SK?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export const TEST_TABLE_NAME = 'test-table';
const PREFIX = 'prefix';

export class TestTable extends Entity {
  // Primary key
  @attribute.prefix(PREFIX)
  @attribute.partitionKey.string()
  partitionKey: string;

  @attribute.sortKey.string()
  sortKey: string;

  // Indexes
  @attribute.gsi.partitionKey.string({ indexName: 'GSI_1_NAME' })
  GSI_1_PK?: string;

  @attribute.gsi.partitionKey.string({ indexName: 'GSI_2_NAME' })
  GSI_2_PK?: string;

  @attribute.gsi.sortKey.number({ indexName: 'GSI_1_NAME' })
  @attribute.gsi.sortKey.number({ indexName: 'GSI_2_NAME' })
  GSI_SK?: number;

  @attribute.lsi.sortKey.number({ indexName: 'LSI_1_NAME' })
  LSI_1_SK?: number;

  // Timestamps
  @attribute.date.string()
  createdAt: Date;

  @attribute.date.number()
  updatedAt: Date;

  constructor(props: TestTableProps) {
    super();

    // Primary key
    this.partitionKey = props.partitionKey;
    this.sortKey = props.sortKey;

    // Indexes
    this.GSI_1_PK = props.GSI_1_PK;
    this.GSI_2_PK = props.GSI_2_PK;
    this.GSI_SK = props.GSI_SK;
    this.LSI_1_SK = props.LSI_1_SK;

    // Timestamps
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}

export type Property = { date: Date };

export type MockEntityProps = TestTableProps & {
  string: string;
  object: {
    optional?: string;
    required: number;
    nestedArray?: Property[];
  };
  array: string[];
  map: Map<string, string>;
  set: Set<string>;
  number?: number;
  boolean: boolean;
  binary: Uint8Array;
};

export class MockEntity extends TestTable {
  @attribute.string()
  string: string;

  @attribute.object()
  object: {
    optional?: string;
    required: number;
    nestedArray?: Property[];
  };

  @attribute.array()
  array?: string[];

  @attribute.map()
  map: Map<string, string>;

  @attribute.set()
  set: Set<string>;

  @attribute.number()
  number?: number;

  @attribute.boolean()
  boolean: boolean;

  @attribute.date.string()
  strDate: Date;

  @attribute.date.number()
  numDate: Date;

  @attribute.binary()
  binary: Uint8Array;

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
    this.strDate = new Date();
    this.numDate = new Date();
    this.binary = props.binary;
    this.unsaved = 'unsaved';
  }

  public method() {
    console.log('method');
  }

  public static staticMethod() {
    console.log('staticMethod');
  }
}

export const TestTableManager = new TableManager(TestTable, {
  tableName: TEST_TABLE_NAME,
  partitionKey: 'partitionKey',
  sortKey: 'sortKey',
  indexes: {
    GSI_1_NAME: {
      partitionKey: 'GSI_1_PK',
      sortKey: 'GSI_SK',
    },
    GSI_2_NAME: {
      partitionKey: 'GSI_2_PK',
      sortKey: 'GSI_SK',
    },
    LSI_1_NAME: {
      sortKey: 'LSI_1_SK',
    },
  },
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

export type TestTableMetadata = typeof TestTableManager.tableMetadata;

export const MockEntityManager = TestTableManager.entityManager(MockEntity);

export const testTableInstance = new TestTable({
  partitionKey: 'PK',
  sortKey: 'SK',
});

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
  binary: new Uint8Array([1, 2, 3]),
});

vi.useRealTimers();
