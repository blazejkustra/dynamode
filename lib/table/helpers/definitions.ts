import { AttributeDefinition } from '@aws-sdk/client-dynamodb';
import Dynamode from '@lib/dynamode';
import Entity from '@lib/entity';
import { getAttributeType } from '@lib/table/helpers/utils';
import { Metadata } from '@lib/table/types';
import { StringOrUndefined } from '@lib/utils';

export function getTableAttributeDefinitions<M extends Metadata<TE>, TE extends typeof Entity>(
  metadata: M,
  tableEntityName: string,
): AttributeDefinition[] {
  const definitions: AttributeDefinition[] = [];
  const attributes = Dynamode.storage.getEntityAttributes(tableEntityName);
  const partitionKey = String(metadata.partitionKey);
  const sortKey = StringOrUndefined(metadata.sortKey);

  definitions.push({
    AttributeName: partitionKey,
    AttributeType: getAttributeType(attributes, partitionKey),
  });

  if (sortKey) {
    definitions.push({
      AttributeName: sortKey,
      AttributeType: getAttributeType(attributes, sortKey),
    });
  }

  if (metadata.indexes) {
    Object.values(metadata.indexes).forEach((index) => {
      const partitionKey = String(index.partitionKey);
      const sortKey = StringOrUndefined(index.sortKey);

      if (partitionKey) {
        definitions.push({
          AttributeName: partitionKey,
          AttributeType: getAttributeType(attributes, partitionKey),
        });
      }

      if (sortKey) {
        definitions.push({
          AttributeName: sortKey,
          AttributeType: getAttributeType(attributes, sortKey),
        });
      }
    });
  }

  return definitions;
}
