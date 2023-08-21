import Entity from '@lib/entity';
import { getTableAttributeDefinitions } from '@lib/table/helpers/definitions';
import { getTableGlobalSecondaryIndexes, getTableLocalSecondaryIndexes } from '@lib/table/helpers/indexes';
import { getKeySchema } from '@lib/table/helpers/schema';
import { compareDynamodeEntityWithDynamoTable } from '@lib/table/helpers/utils';
import { Metadata, ValidateTableSync } from '@lib/table/types';

export function validateTable<M extends Metadata<TE>, TE extends typeof Entity>({
  metadata,
  tableNameEntity,
  table = {},
}: ValidateTableSync<M, TE>) {
  const {
    LocalSecondaryIndexes = [],
    GlobalSecondaryIndexes = [],
    AttributeDefinitions: tableAttributeDefinitions = [],
    KeySchema: tableKeySchema = [],
  } = table;

  const tableLocalSecondaryIndexes = LocalSecondaryIndexes.map((v) => ({
    IndexName: v.IndexName,
    KeySchema: v.KeySchema,
  }));
  const tableGlobalSecondaryIndexes = GlobalSecondaryIndexes.map((v) => ({
    IndexName: v.IndexName,
    KeySchema: v.KeySchema,
  }));
  const keySchema = getKeySchema(metadata.partitionKey, metadata.sortKey);
  const attributeDefinitions = getTableAttributeDefinitions(metadata, tableNameEntity);
  const localSecondaryIndexes = getTableLocalSecondaryIndexes(metadata).map((v) => ({
    IndexName: v.IndexName,
    KeySchema: v.KeySchema,
  }));
  const globalSecondaryIndexes = getTableGlobalSecondaryIndexes(metadata).map((v) => ({
    IndexName: v.IndexName,
    KeySchema: v.KeySchema,
  }));

  compareDynamodeEntityWithDynamoTable(keySchema, tableKeySchema);
  compareDynamodeEntityWithDynamoTable(attributeDefinitions, tableAttributeDefinitions);
  compareDynamodeEntityWithDynamoTable(localSecondaryIndexes, tableLocalSecondaryIndexes);
  compareDynamodeEntityWithDynamoTable(globalSecondaryIndexes, tableGlobalSecondaryIndexes);
}
