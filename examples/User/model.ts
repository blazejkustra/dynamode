import attribute from '../../dist/decorators';
import Dynamode from '../../dist/dynamode';
import Entity from '../../dist/entity';
import TableManager from '../../dist/table';

Dynamode.ddb.local();

type UserProps = {
  partitionKey: string;
  sortKey: string;
  username: string;
  email: string;
  age: number;
  friends: string[];
  config: {
    isAdmin: boolean;
  };
};

const USERS_TABLE = 'users';

export class User extends Entity {
  @attribute.partitionKey.string()
  partitionKey: string;

  @attribute.sortKey.string()
  sortKey: string;

  @attribute.string()
  username: string;

  @attribute.string()
  email: string;

  @attribute.number()
  age: number;

  @attribute.array()
  friends: string[];

  @attribute.object()
  config: {
    isAdmin: boolean;
  };

  constructor(props: UserProps) {
    super();

    // Primary key
    this.partitionKey = props.partitionKey;
    this.sortKey = props.sortKey;

    // Other properties
    this.username = props.username;
    this.email = props.email;
    this.age = props.age;
    this.friends = props.friends;
    this.config = props.config;
  }
}

export const UserTableManager = new TableManager(User, {
  tableName: USERS_TABLE,
  partitionKey: 'partitionKey',
  sortKey: 'sortKey',
});

export const UserManager = UserTableManager.entityManager();

async function create() {
  const table = await UserTableManager.create();
  console.log(table);
}
