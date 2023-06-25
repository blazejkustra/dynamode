import Entity from '@lib/entity';
import { getTableAttributeDefinitions } from '@lib/table/helpers/definitions';
import { getTableGlobalSecondaryIndexes, getTableLocalSecondaryIndexes } from '@lib/table/helpers/indexes';
import { getKeySchema } from '@lib/table/helpers/schema';
import { compareDynamodeEntityWithDynamoTable } from '@lib/table/helpers/utils';
import { Metadata, ValidateTableSync } from '@lib/table/types';

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
