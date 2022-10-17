import { Entity } from '../../dist';
import { attribute, primaryPartitionKey, primarySortKey, register } from '../../dist/decorators';

import { ddb } from './setup';

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

@register(ddb)
export class User extends Entity<UserKeys>(USERS_TABLE) {
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
