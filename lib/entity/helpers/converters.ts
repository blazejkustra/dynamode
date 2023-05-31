import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import { prefixSuffixValue, truncateValue } from '@lib/entity/helpers/prefixSuffix';
import { EntityKey } from '@lib/entity/types';
import { Metadata, TablePrimaryKey } from '@lib/table/types';
import { AttributeValues, fromDynamo, GenericObject, InvalidParameter, objectToDynamo } from '@lib/utils';

export function convertAttributeValuesToEntity<E extends typeof Entity>(
  entity: E,
  dynamoItem: AttributeValues,
): InstanceType<E> {
  const object = fromDynamo(dynamoItem);
  const attributes = Dynamode.storage.getEntityAttributes(entity.name);

  Object.values(attributes).forEach((attribute) => {
    let value = object[attribute.propertyName];

    if (value && typeof value === 'object' && attribute.type === Map) {
      value = new Map(Object.entries(value));
    }

    if (value && (typeof value === 'string' || typeof value === 'number') && attribute.role === 'date') {
      value = new Date(value);
    }

    object[attribute.propertyName] = truncateValue(entity, attribute.propertyName as EntityKey<E>, value);
  });

  return new entity(object) as InstanceType<E>;
}

export function convertEntityToAttributeValues<E extends typeof Entity>(
  entity: E,
  item: InstanceType<E>,
): AttributeValues {
  const dynamoObject: GenericObject = {};
  const attributes = Dynamode.storage.getEntityAttributes(entity.name);

  Object.values(attributes).forEach((attribute) => {
    let value: unknown = item[attribute.propertyName as keyof InstanceType<E>];

    if (value instanceof Date) {
      if (attribute.role !== 'date') {
        throw new InvalidParameter('Invalid date attribute role');
      }

      switch (attribute.type) {
        case String: {
          value = value.toISOString();
          break;
        }
        case Number: {
          value = value.getTime();
          break;
        }
        default: {
          throw new InvalidParameter('Invalid date attribute type');
        }
      }
    }

    dynamoObject[attribute.propertyName] = prefixSuffixValue(entity, attribute.propertyName as EntityKey<E>, value);
  });

  return objectToDynamo(dynamoObject);
}

export function convertAttributeValuesToPrimaryKey<M extends Metadata<E>, E extends typeof Entity>(
  entity: E,
  dynamoItem: AttributeValues,
): TablePrimaryKey<M, E> {
  const object = fromDynamo(dynamoItem);
  const { partitionKey, sortKey } = Dynamode.storage.getEntityMetadata(entity.name);

  object[partitionKey] = truncateValue(entity, partitionKey as EntityKey<E>, object[partitionKey]);

  if (sortKey) {
    object[sortKey] = truncateValue(entity, sortKey as EntityKey<E>, object[sortKey]);
  }

  return object as TablePrimaryKey<M, E>;
}

export function convertPrimaryKeyToAttributeValues<M extends Metadata<E>, E extends typeof Entity>(
  entity: E,
  primaryKey: TablePrimaryKey<M, E>,
): AttributeValues {
  const dynamoObject: GenericObject = {};
  const { partitionKey, sortKey } = Dynamode.storage.getEntityMetadata(entity.name);

  dynamoObject[partitionKey] = prefixSuffixValue(entity, partitionKey as EntityKey<E>, (<any>primaryKey)[partitionKey]);

  if (sortKey) {
    dynamoObject[sortKey] = prefixSuffixValue(entity, sortKey as EntityKey<E>, (<any>primaryKey)[sortKey]);
  }

  return objectToDynamo(dynamoObject);
}
