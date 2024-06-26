import attribute from '../../dist/decorators';
import Dynamode from '../../dist/dynamode';
import Entity from '../../dist/entity';
import TableManager from '../../dist/table';

Dynamode.ddb.local();

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
  binary: Uint8Array;
};

const TABLE_NAME = 'all-possible-properties';
const PREFIX = 'prefix';

export class AllPossibleProperties extends Entity {
  // Primary key
  @attribute.prefix(PREFIX)
  @attribute.partitionKey.string()
  partitionKey: string;

  @attribute.sortKey.string()
  sortKey: string;

  // Indexes
  @attribute.gsi.partitionKey.string({ indexName: 'GSI_1_NAME' })
  GSI_1_PK?: string;

  @attribute.gsi.sortKey.number({ indexName: 'GSI_1_NAME' })
  GSI_1_SK?: number;

  @attribute.lsi.sortKey.number({ indexName: 'LSI_1_NAME' })
  LSI_1_SK?: number;

  // Timestamps
  @attribute.date.string()
  createdAt: Date;

  @attribute.date.number()
  updatedAt: Date;

  @attribute.string()
  string: string;

  @attribute.object()
  object: {
    optional?: string;
    required: number;
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

  @attribute.binary()
  binary: Uint8Array;

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
const AllPossiblePropertiesTableManager = new TableManager(AllPossibleProperties, {
  tableName: TABLE_NAME,
  partitionKey: 'partitionKey',
  sortKey: 'sortKey',
  indexes: {
    GSI_1_NAME: {
      partitionKey: 'GSI_1_PK',
      sortKey: 'GSI_1_SK',
    },
    LSI_1_NAME: {
      sortKey: 'LSI_1_SK',
    },
  },
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

export const AllPossiblePropertiesManager = AllPossiblePropertiesTableManager.entityManager();

async function create() {
  const table = await AllPossiblePropertiesTableManager.createTable();
  console.log(table);
}

async function createIndex() {
  const table = await AllPossiblePropertiesTableManager.createTableIndex('GSI_1_NAME');
  console.log(table);
}

async function deleteIndex() {
  const table = await AllPossiblePropertiesTableManager.deleteTableIndex('GSI_1_NAME');
  console.log(table);
}

async function validateTable() {
  const table = await AllPossiblePropertiesTableManager.validateTable();
  console.log(table);
}
