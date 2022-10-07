import { column, prefix } from '../../dist/decorators';

import { UserTable, UserTableProps } from './UserTable';

export type UserProps = UserTableProps & {
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

const USER_OBJECT = 'user';
export class User extends UserTable {
  @prefix(USER_OBJECT)
  PK: string;

  @prefix(USER_OBJECT)
  GSI_1_PK: string;

  @column(String)
  string: string;

  @column(Object)
  object: {
    optional?: string;
    required: number;
  };

  @column(Array)
  array?: string[];

  @column(Map)
  map: Map<string, string>;

  @column(Set)
  set: Set<string>;

  @column(Number)
  number?: number;

  @column(Boolean)
  boolean: boolean;

  unsaved: string;

  constructor(props: UserProps) {
    super(props);
    // GSI_1_INDEX: Users sorted
    this.GSI_1_PK = props.GSI_1_PK || props.SK;
    this.GSI_1_SK = props.GSI_1_SK || this.createdAt.getTime();

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

  public staticMethod() {
    console.log('staticMethod');
  }
}
