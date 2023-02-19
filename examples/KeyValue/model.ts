import attribute from '../../dist/decorators';
import Entity from '../../dist/entity';
import { tableManager } from '../../dist/table';

type KeyValueProps = {
  key: string;
  value: Record<string, unknown>;
};

const TABLE_NAME = 'key-value';

export class KeyValue extends Entity {
  @attribute.partitionKey.string()
  key: string;

  @attribute.object()
  value: Record<string, unknown>;

  constructor(props: KeyValueProps) {
    super();

    this.key = props.key;
    this.value = props.value;
  }
}

export const keyValueManager = tableManager(KeyValue)
  .metadata({
    tableName: TABLE_NAME,
    partitionKey: 'key',
  })
  .tableEntityManager();
