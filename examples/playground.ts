import attribute from '../dist/decorators';
import Entity from '../dist/entity';
import TableManager from '../dist/table';

export class TableUser extends Entity {
  @attribute.gsi.partitionKey.string({ indexName: 'index-1' })
  @attribute.partitionKey.string()
  domain: string;

  @attribute.sortKey.string()
  @attribute.gsi.sortKey.string({ indexName: 'index-1' })
  email: string;

  constructor(data: { domain: string; email: string }) {
    super(data);
    this.domain = data.domain;
    this.email = data.email;
  }
}

export const UserdataTableManager = new TableManager(TableUser, {
  tableName: 'USERS_TABLE_NAME',
  partitionKey: 'domain',
  sortKey: 'email',
  indexes: {
    'index-1': {
      partitionKey: 'domain',
      sortKey: 'email',
    },
  },
});

const EntityManager = UserdataTableManager.entityManager();

async function test() {
  const entity = await EntityManager.put(
    new TableUser({
      domain: 'test',
      email: 'not_empty',
    }),
  );
  console.log(entity);
}

async function createTable() {
  const table = await UserdataTableManager.createTable();
  console.log(table);
}

// createTable();
test();
