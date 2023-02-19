import { attribute } from '../../dist/decorators';
import { Entity, register } from '../../dist/entity';

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
  @attribute.date.string({ as: 'createdAt' })
  createdAt: Date;

  @attribute.date.number({ as: 'updatedAt' })
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

export const AllPossiblePropertiesRegistry = register<AllPossiblePropertiesKeys, typeof AllPossibleProperties>(
  AllPossibleProperties,
  TABLE_NAME,
);
