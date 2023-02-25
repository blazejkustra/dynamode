import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import { EntityKey } from '@lib/entity/types';
import { Metadata, TablePrimaryKey } from '@lib/table/types';
import { AttributeValues, DefaultError, fromDynamo, GenericObject, objectToDynamo } from '@lib/utils';

import { prefixSuffixValue, truncateValue } from './prefixSuffix';

export function convertAttributeValuesToEntity<E extends typeof Entity>(
  entity: E,
  dynamoItem: AttributeValues,
): InstanceType<E> {
  const object = fromDynamo(dynamoItem);
  const attributes = Dynamode.storage.getEntityAttributes(entity.name);
  const { createdAt, updatedAt } = Dynamode.storage.getEntityMetadata(entity.name);

  if (createdAt) {
    object[createdAt] = new Date(object[createdAt] as string | number);
  }
  if (updatedAt) {
    object[updatedAt] = new Date(object[updatedAt] as string | number);
  }

  Object.entries(attributes).forEach(([propertyName, metadata]) => {
    let value = object[propertyName];

    if (value && typeof value === 'object' && metadata.type === Map) {
      value = new Map(Object.entries(value));
    }

    object[propertyName] = truncateValue(entity, propertyName as EntityKey<E>, value);
  });

  return new entity(object) as InstanceType<E>;
}

export function convertEntityToAttributeValues<E extends typeof Entity>(
  entity: E,
  item: InstanceType<E>,
): AttributeValues {
  const dynamoObject: GenericObject = {};
  const attributes = Dynamode.storage.getEntityAttributes(entity.name);

  Object.keys(attributes).forEach((propertyName) => {
    let value: unknown = item[propertyName as keyof InstanceType<E>];

    if (value instanceof Date) {
      if (attributes[propertyName].type === String) {
        value = value.toISOString();
      } else if (attributes[propertyName].type === Number) {
        value = value.getTime();
      } else {
        throw new DefaultError();
      }
    }

    dynamoObject[propertyName] = prefixSuffixValue(entity, propertyName as EntityKey<E>, value);
  });

  return objectToDynamo(dynamoObject);
}

export function convertAttributeValuesToPrimaryKey<M extends Metadata<E>, E extends typeof Entity>(
  entity: E,
  dynamoItem: AttributeValues,
): TablePrimaryKey<M, E> {
  const object = fromDynamo(dynamoItem);
  const { partitionKey, sortKey } = Dynamode.storage.getEntityMetadata(entity.name);

  if (partitionKey) {
    object[partitionKey] = truncateValue(entity, partitionKey as EntityKey<E>, object[partitionKey]);
  }
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

  if (partitionKey) {
    dynamoObject[partitionKey] = prefixSuffixValue(
      entity,
      partitionKey as EntityKey<E>,
      (<any>primaryKey)[partitionKey],
    );
  }
  if (sortKey) {
    dynamoObject[sortKey] = prefixSuffixValue(entity, sortKey as EntityKey<E>, (<any>primaryKey)[sortKey]);
  }

  return objectToDynamo(dynamoObject);
}
