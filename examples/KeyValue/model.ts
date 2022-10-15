import { Entity } from '../../dist';
import { column, primaryPartitionKey, register } from '../../dist/decorators';

import { ddb } from './setup';

type KeyValueKeys = {
  partitionKey: 'key';
};

type KeyValueProps = {
  key: string;
  value: Record<string, unknown>;
};

const TABLE = 'key-value';

@register(ddb)
export class KeyValue extends Entity<KeyValueKeys>(TABLE) {
  @primaryPartitionKey(String)
  key: string;

  @column(Object)
  value: Record<string, unknown>;

  constructor(props: KeyValueProps) {
    super();

    this.key = props.key;
    this.value = props.value;
  }
}
