import attribute from '../../dist/decorators';
import Entity from '../../dist/entity';
import { tableManager } from '../../dist/table';

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

export class EntityReservedWord extends Entity {
  // Primary key
  @attribute.partitionKey.string()
  COLUMN: string;

  @attribute.sortKey.string()
  OBJECT: string;

  // Indexes
  @attribute.gsi.partitionKey.string({ indexName: 'OTHER' })
  COPY?: string;

  @attribute.gsi.sortKey.number({ indexName: 'OTHER' })
  DEFAULT?: number;

  @attribute.lsi.sortKey.number({ indexName: 'PRIMARY' })
  old?: number;

  // Timestamps
  @attribute.date.string()
  DAY: Date;

  @attribute.date.number()
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

export const reservedWordManager = tableManager(EntityReservedWord)
  .metadata({
    tableName: TABLE_NAME,
    partitionKey: 'COLUMN',
    sortKey: 'OBJECT',
    indexes: {
      OTHER: {
        partitionKey: 'COPY',
        sortKey: 'DEFAULT',
      },
      PRIMARY: {
        sortKey: 'old',
      },
    },
  })
  .tableEntityManager();
