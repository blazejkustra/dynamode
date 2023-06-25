import Entity from '@lib/entity';
import { Metadata, ValidateTableSync } from '@lib/table/types';
import { ConflictError, deepEqual } from '@lib/utils';

import { getTableAttributeDefinitions } from './definitions';
import { getTableGlobalSecondaryIndexes, getTableLocalSecondaryIndexes } from './indexes';
import { getKeySchema } from './schema';

export function validateTableSync<M extends Metadata<TE>, TE extends typeof Entity>({
  metadata,
  tableNameEntity,
  table,
}: ValidateTableSync<M, TE>) {
  const tableKeySchema = table?.KeySchema;
  const tableAttributeDefinitions = table?.AttributeDefinitions;
  const tableLocalSecondaryIndexes = table?.LocalSecondaryIndexes?.map((v) => ({
    IndexName: v.IndexName,
    KeySchema: v.KeySchema,
  }));
  const tableGlobalSecondaryIndexes = table?.GlobalSecondaryIndexes?.map((v) => ({
    IndexName: v.IndexName,
    KeySchema: v.KeySchema,
  }));

  const keySchema = getKeySchema(String(metadata.partitionKey), String(metadata.sortKey));
  const attributeDefinitions = getTableAttributeDefinitions(metadata, tableNameEntity);
  const localSecondaryIndexes = getTableLocalSecondaryIndexes(metadata).map((v) => ({
    IndexName: v.IndexName,
    KeySchema: v.KeySchema,
  }));
  const globalSecondaryIndexes = getTableGlobalSecondaryIndexes(metadata).map((v) => ({
    IndexName: v.IndexName,
    KeySchema: v.KeySchema,
  }));

  compareDynamodeEntityWithDynamoTable(keySchema, tableKeySchema || []);
  compareDynamodeEntityWithDynamoTable(attributeDefinitions, tableAttributeDefinitions || []);
  compareDynamodeEntityWithDynamoTable(localSecondaryIndexes, tableLocalSecondaryIndexes || []);
  compareDynamodeEntityWithDynamoTable(globalSecondaryIndexes, tableGlobalSecondaryIndexes || []);
}

function compareDynamodeEntityWithDynamoTable<T>(aa: T[], bb: T[]): void {
  aa.forEach((a) => {
    if (!bb?.some((b) => deepEqual(a, b))) {
      throw new ConflictError(`Key "${JSON.stringify(a)}" not found in table`);
    }
  });

  bb.forEach((a) => {
    if (!aa.some((b) => deepEqual(a, b))) {
      throw new ConflictError(`Key "${JSON.stringify(a)}" not found in entity`);
    }
  });

  if (aa.length !== bb.length) {
    throw new ConflictError('Key schema length mismatch between table and entity');
  }
}
