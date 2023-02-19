import Dynamode from '@lib/dynamode/index';
import Entity, { entityManager as _entityManager } from '@lib/entity';
import { Metadata } from '@lib/table/types';
import { Narrow } from '@lib/utils';

export function tableManager<TE extends typeof Entity>(tableEntity: TE) {
  function metadata<M extends Metadata<TE>>(tableMetadata: Narrow<M>) {
    return registeredTableManager<M, TE>(tableEntity, tableMetadata as M);
  }

  return {
    metadata,
  };
}

function registeredTableManager<M extends Metadata<TE>, TE extends typeof Entity>(tableEntity: TE, tableMetadata: M) {
  Dynamode.storage.registerTable(tableEntity, tableMetadata);
  Dynamode.storage.registerEntity(tableEntity, tableMetadata.tableName);

  function entityManager<E extends TE>(entity: E) {
    Dynamode.storage.registerEntity(entity, tableMetadata.tableName);
    return _entityManager<M, E>(entity, tableMetadata.tableName);
  }

  function tableEntityManager() {
    return _entityManager<M, TE>(tableEntity, tableMetadata.tableName);
  }

  return {
    entityManager,
    tableEntityManager,
    tableMetadata,
    // create: () => console.log('Not yet implemented, should create a table in future'),
    // validate: () => console.log('Not yet implemented, should validate table attributes'),
  };
}
