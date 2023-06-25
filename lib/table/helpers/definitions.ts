import { AttributeDefinition } from '@aws-sdk/client-dynamodb';
import { Dynamode } from '@lib/dynamode';
import { AttributesMetadata } from '@lib/dynamode/storage/types';
import Entity from '@lib/entity';
import { Metadata } from '@lib/table/types';
import { DYNAMODE_DYNAMO_KEY_TYPE_MAP, ValidationError } from '@lib/utils';

function getAttributeType(attributes: AttributesMetadata, attribute: string): 'S' | 'N' {
  const attributeType = DYNAMODE_DYNAMO_KEY_TYPE_MAP.get(attributes[String(attribute)].type);

  if (!attributeType) {
    throw new ValidationError(`Attribute "${String(attribute)}" is registered with invalid type.`);
  }

  return attributeType;
}

export function getTableAttributeDefinitions<M extends Metadata<TE>, TE extends typeof Entity>(
  metadata: M,
  tableEntityName: string,
): AttributeDefinition[] {
  const definitions: AttributeDefinition[] = [];
  const attributes = Dynamode.storage.getEntityAttributes(tableEntityName);
  const partitionKey = String(metadata.partitionKey);
  const sortKey = String(metadata.sortKey);

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
      const sortKey = String(index.sortKey);

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
