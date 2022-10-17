import { Entity } from '../../dist';
import { attribute, primaryPartitionKey, register } from '../../dist/decorators';

import { ddb } from './setup';

type KeyValueKeys = {
  partitionKey: 'key';
};

type KeyValueProps = {
  key: string;
  value: Record<string, unknown>;
};

const TABLE_NAME = 'key-value';

@register(ddb)
export class KeyValue extends Entity<KeyValueKeys>(TABLE_NAME) {
  @primaryPartitionKey(String)
  key: string;

  @attribute(Object)
  value: Record<string, unknown>;

  constructor(props: KeyValueProps) {
    super();

    this.key = props.key;
    this.value = props.value;
  }
}
