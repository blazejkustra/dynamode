import { TableDescription } from '@aws-sdk/client-dynamodb';
import { TableInformation } from '@lib/table/types';
import { ValidationError } from '@lib/utils';

export function convertToTableInformation(tableDescription?: TableDescription): TableInformation {
  if (
    !tableDescription ||
    !tableDescription.TableName ||
    !tableDescription.TableStatus ||
    !tableDescription.CreationDateTime ||
    !tableDescription.AttributeDefinitions ||
    !tableDescription.KeySchema
  ) {
    throw new ValidationError('Table description is invalid.');
  }

  return {
    tableName: tableDescription.TableName,
    status: tableDescription.TableStatus,
    attributeDefinitions: tableDescription.AttributeDefinitions.map((ad) => {
      if (!ad.AttributeName || !ad.AttributeType) {
        throw new ValidationError('Attribute Definition is invalid.');
      }
      return { name: ad.AttributeName, type: ad.AttributeType };
    }),
    keySchema: tableDescription.KeySchema.map((ks) => {
      if (!ks.AttributeName || !ks.KeyType) {
        throw new ValidationError('Key schema is invalid.');
      }
      return { name: ks.AttributeName, type: ks.KeyType };
    }),
    itemCount: tableDescription.ItemCount ?? 0,
    tableSizeBytes: tableDescription.TableSizeBytes ?? 0,
    billingMode: tableDescription.BillingModeSummary?.BillingMode,
    creationTime: tableDescription.CreationDateTime,
    localSecondaryIndexes:
      tableDescription.LocalSecondaryIndexes?.map((lsi) => {
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
      }) ?? [],
    globalSecondaryIndexes:
      tableDescription.LocalSecondaryIndexes?.map((lsi) => {
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
      }) ?? [],
  };
}
