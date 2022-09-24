import { column, entity } from '../../dist/decorators';
import { Entity } from '../../dist/entity';

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

const OBJECT = 'user';
@entity()
export class User extends Entity(UserTable) {
  @column(String, { prefix: 'emailPREFIX' })
  string: string;

  @column(Object, { prefix: 'adresPREFIX', suffix: 'adresSuffix' })
  object: {
    optional?: string;
    required: number;
  };

  @column(Array)
  array?: string[];

  @column(Map)
  map: Map<string, string>;

  @column(Set, { suffix: 'setPREFIX' })
  set: Set<string>;

  @column(Number)
  number?: number;

  @column(Boolean)
  boolean: boolean;

  constructor(props: UserProps) {
    super(props);
    // GSI_1_INDEX: Users sorted
    this.GSI_1_PK = props.GSI_1_PK || `${OBJECT}#${props.PK}`;
    this.GSI_1_SK = props.GSI_1_SK || this.createdAt.getTime();

    this.string = props.string;
    this.object = props.object;
    this.array = props.array;
    this.map = props.map;
    this.set = props.set;
    this.number = props.number;
    this.boolean = props.boolean;
  }
}
