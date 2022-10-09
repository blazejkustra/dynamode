import { column, prefix } from '../../dist/decorators';

import { UserTable, UserTableProps } from './UserTable';

export type UserConfigProps = UserTableProps & {
  config: string;
};

const USER_OBJECT = 'userConfig';
export class UserConfig extends UserTable {
  @prefix(USER_OBJECT)
  PK: string;

  @prefix(USER_OBJECT)
  GSI_1_PK: string;

  @column(String)
  config: string;

  constructor(props: UserConfigProps) {
    super(props);
    // GSI_1_INDEX: Users sorted
    this.GSI_1_PK = props.GSI_1_PK || props.SK;
    this.GSI_1_SK = props.GSI_1_SK || this.createdAt.getTime();

    this.config = props.config;
  }
}
