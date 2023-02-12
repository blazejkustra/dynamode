import { attribute, primaryPartitionKey, primarySortKey } from '../../dist/decorators';
import { Entity, register } from '../../dist/entity';

type UserKeys = {
  partitionKey: 'partitionKey';
  sortKey: 'sortKey';
};

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
  @primaryPartitionKey(String)
  partitionKey: string;

  @primarySortKey(String)
  sortKey: string;

  @attribute(String)
  username: string;

  @attribute(String)
  email: string;

  @attribute(Number)
  age: number;

  @attribute(Array)
  friends: string[];

  @attribute(Object)
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

export const UserRegistry = register<UserKeys, typeof User>(User, USERS_TABLE);
