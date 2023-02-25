import Dynamode from '@lib/dynamode/index';
import Entity, { entityManager as _entityManager } from '@lib/entity';
import { Metadata } from '@lib/table/types';
import { Narrow } from '@lib/utils';

class TableManager<M extends Metadata<TE>, TE extends typeof Entity> {
  public tableMetadata: M;
  public tableEntity: TE;

  constructor(tableMetadata: M, tableEntity: TE) {
    Dynamode.storage.registerTable(tableEntity, tableMetadata);
    Dynamode.storage.registerEntity(tableEntity, tableMetadata.tableName);

    this.tableMetadata = tableMetadata;
    this.tableEntity = tableEntity;
  }

  public entityManager<E extends TE>(entity: E) {
    Dynamode.storage.registerEntity(entity, this.tableMetadata.tableName);
    return _entityManager<M, E>(entity, this.tableMetadata.tableName);
  }

  public tableEntityManager() {
    return _entityManager<M, TE>(this.tableEntity, this.tableMetadata.tableName);
  }

  // create: () => console.log('Not yet implemented, should create a table in future'),
  // validate: () => console.log('Not yet implemented, should validate table attributes'),
}

export function tableManager<TE extends typeof Entity>(tableEntity: TE) {
  function metadata<M extends Metadata<TE>>(tableMetadata: Narrow<M>) {
    return new TableManager(tableMetadata as M, tableEntity);
  }

  return {
    metadata,
  };
}
