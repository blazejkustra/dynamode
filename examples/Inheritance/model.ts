import attribute from '../../dist/decorators';
import Entity from '../../dist/entity';
import { tableManager } from '../../dist/table';

type TableProps = {
  propPk: string;
  propSk: number;
  index: string;
};

const TABLE_NAME = 'inheritance';

class BaseTable extends Entity {
  @attribute.partitionKey.string()
  propPk: string;

  @attribute.sortKey.number()
  propSk: number;

  @attribute.lsi.sortKey.string({ indexName: 'LSI_NAME' })
  index: string;

  constructor(props: TableProps) {
    super();

    this.propPk = props.propPk;
    this.propSk = props.propSk;
    this.index = props.index;
  }
}

type EntityOneProps = TableProps & {
  one: { [k: string]: number };
};

export class EntityOne extends BaseTable {
  @attribute.object()
  one: { [k: string]: number };

  constructor(props: EntityOneProps) {
    super(props);

    this.one = props.one;
  }
}

type EntityTwoProps = EntityOneProps & {
  two: { [k: string]: string };
};

export class EntityTwo extends EntityOne {
  @attribute.object()
  two: { [k: string]: string };

  constructor(props: EntityTwoProps) {
    super(props);

    this.two = props.two;
  }
}

type EntityThreeProps = TableProps & {
  otherProperty: any;
};

export class EntityThree extends BaseTable {
  @attribute.object()
  otherProperty: { [k: string]: number };

  constructor(props: EntityThreeProps) {
    super(props);

    this.otherProperty = props.otherProperty;
  }
}

export const baseTable = tableManager(BaseTable).metadata({
  tableName: TABLE_NAME,
  partitionKey: 'propPk',
  sortKey: 'propSk',
  indexes: {
    LSI_NAME: {
      sortKey: 'index',
    },
  },
});

export const EntityOneManager = baseTable.entityManager(EntityOne);
export const EntityTwoManager = baseTable.entityManager(EntityTwo);
export const EntityThreeManager = baseTable.entityManager(EntityThree);
