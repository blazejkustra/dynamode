import { TableDescription } from '@aws-sdk/client-dynamodb';
import { TableInformation } from '@lib/table/types';
import { ValidationError } from '@lib/utils';

export function convertToTableInformation({
  TableName,
  TableStatus,
  AttributeDefinitions,
  KeySchema,
  ItemCount = 0,
  TableSizeBytes = 0,
  BillingModeSummary,
  CreationDateTime,
  LocalSecondaryIndexes = [],
  GlobalSecondaryIndexes = [],
}: TableDescription = {}): TableInformation {
  if (!TableName || !TableStatus || !CreationDateTime || !AttributeDefinitions || !KeySchema) {
    throw new ValidationError('Table description is invalid.');
  }

  return {
    tableName: TableName,
    status: TableStatus,
    attributeDefinitions: AttributeDefinitions.map((ad) => {
      if (!ad.AttributeName || !ad.AttributeType) {
        throw new ValidationError('Attribute Definition is invalid.');
      }
      return { name: ad.AttributeName, type: ad.AttributeType };
    }),
    keySchema: KeySchema.map((ks) => {
      if (!ks.AttributeName || !ks.KeyType) {
        throw new ValidationError('Key schema is invalid.');
      }
      return { name: ks.AttributeName, type: ks.KeyType };
    }),
    itemCount: ItemCount,
    tableSizeBytes: TableSizeBytes,
    billingMode: BillingModeSummary?.BillingMode,
    creationTime: CreationDateTime,
    localSecondaryIndexes: LocalSecondaryIndexes?.map((lsi) => {
      if (!lsi.IndexName || !lsi.KeySchema) {
        throw new ValidationError('Local Secondary Index is invalid.');
      }
      return {
        indexName: lsi.IndexName,
        keySchema: lsi.KeySchema.map((ks) => {
          if (!ks.AttributeName || !ks.KeyType) {
            throw new ValidationError('Key schema is invalid.');
          }
          return { name: ks.AttributeName, type: ks.KeyType };
        }),
        itemCount: lsi.ItemCount ?? 0,
      };
    }),
    globalSecondaryIndexes: GlobalSecondaryIndexes?.map((lsi) => {
      if (!lsi.IndexName || !lsi.KeySchema) {
        throw new ValidationError('Local Secondary Index is invalid.');
      }
      return {
        indexName: lsi.IndexName,
        keySchema: lsi.KeySchema.map((ks) => {
          if (!ks.AttributeName || !ks.KeyType) {
            throw new ValidationError('Key schema is invalid.');
          }
          return { name: ks.AttributeName, type: ks.KeyType };
        }),
        itemCount: lsi.ItemCount ?? 0,
      };
    }),
  };
}
