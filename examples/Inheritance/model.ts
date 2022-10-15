import { Entity } from '../../dist';
import { column, lsiSortKey, primaryPartitionKey, primarySortKey, register } from '../../dist/decorators';

import { ddb } from './setup';

type TableKeys = {
  partitionKey: 'propPk';
  sortKey: 'propSk';
  indexes: {
    LSI_NAME: {
      sortKey: 'index';
    };
  };
};

type TableProps = {
  propPk: string;
  propSk: number;
  index: string;
};

const TABLE_NAME = 'inheritance';

@register(ddb)
class BaseTable extends Entity<TableKeys>(TABLE_NAME) {
  @primaryPartitionKey(String)
  propPk: string;

  @primarySortKey(Number)
  propSk: number;

  @lsiSortKey(String, 'LSI_NAME')
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
  @column(Object)
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
  @column(Object)
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
  @column(Object)
  otherProperty: { [k: string]: number };

  constructor(props: EntityThreeProps) {
    super(props);

    this.otherProperty = props.otherProperty;
  }
}
