import Entity from '@lib/entity';
import { TableManager } from '@lib/table/TableManager';
import { Metadata } from '@lib/table/types';
import { Narrow } from '@lib/utils';

export default function tableManager<TE extends typeof Entity>(tableEntity: TE) {
  function metadata<M extends Metadata<TE>>(tableMetadata: Narrow<M>) {
    return new TableManager(tableMetadata as M, tableEntity);
  }

  return {
    metadata,
  };
}
