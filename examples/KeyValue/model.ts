import attribute from '../../dist/decorators';
import Dynamode from '../../dist/dynamode';
import Entity from '../../dist/entity';
import TableManager from '../../dist/table';

Dynamode.ddb.local();

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

export const KeyValueTableManager = new TableManager(KeyValue, {
  tableName: TABLE_NAME,
  partitionKey: 'key',
});

export const KeyValueManager = KeyValueTableManager.entityManager();

async function create() {
  const table = await KeyValueTableManager.create({
    tags: {
      'dynamode:example': 'key-value',
    },
    throughput: {
      read: 1,
      write: 1,
    },
    deletionProtection: true,
  });
  console.log(table);
}

async function createIndex() {
  const table = await KeyValueTableManager.createIndex('test');
  console.log(table);
}

async function deleteIndex() {
  const table = await KeyValueTableManager.deleteIndex('test');
  console.log(table);
}

async function validateTable() {
  const table = await KeyValueTableManager.validate();
  console.log(table);
}
