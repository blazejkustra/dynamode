import { AttributeDefinition } from '@aws-sdk/client-dynamodb';
import Dynamode from '@lib/dynamode';
import Entity from '@lib/entity';
import { getAttributeType } from '@lib/table/helpers/utils';
import { Metadata } from '@lib/table/types';

export function getTableAttributeDefinitions<M extends Metadata<TE>, TE extends typeof Entity>(
  metadata: M,
  tableEntityName: string,
): AttributeDefinition[] {
  const definitions: AttributeDefinition[] = [];
  const attributes = Dynamode.storage.getEntityAttributes(tableEntityName);
  const { partitionKey, sortKey } = metadata;

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
      const { partitionKey, sortKey } = index;

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

  const uniqueDefinitions = [
    ...new Map(definitions.map((definition) => [definition.AttributeName, definition])).values(),
  ];

  return uniqueDefinitions;
}
