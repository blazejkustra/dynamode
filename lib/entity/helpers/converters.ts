import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import { transformValue, truncateValue } from '@lib/entity/helpers/transformValues';
import { Metadata, TablePrimaryKey, TableRetrieverLastKey } from '@lib/table/types';
import { AttributeValues, fromDynamo, GenericObject, objectToDynamo } from '@lib/utils';

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

    object[attribute.propertyName] = truncateValue(entity, attribute.propertyName, value);
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
    dynamoObject[attribute.propertyName] = transformValue(
      entity,
      attribute.propertyName,
      item[attribute.propertyName as keyof InstanceType<E>],
    );
  });

  return objectToDynamo(dynamoObject);
}

export function convertAttributeValuesToLastKey<M extends Metadata<E>, E extends typeof Entity>(
  entity: E,
  dynamoItem: AttributeValues,
): TableRetrieverLastKey<M, E> {
  const object = fromDynamo(dynamoItem);
  const { partitionKey, sortKey, indexes } = Dynamode.storage.getEntityMetadata(entity.name);

  object[partitionKey] = truncateValue(entity, partitionKey, object[partitionKey]);

  if (sortKey) {
    object[sortKey] = truncateValue(entity, sortKey, object[sortKey]);
  }

  Object.values(indexes ?? {}).forEach((index) => {
    if (index.partitionKey) {
      object[index.partitionKey] = truncateValue(entity, index.partitionKey, object[index.partitionKey]);
    }

    if (index.sortKey) {
      object[index.sortKey] = truncateValue(entity, index.sortKey, object[index.sortKey]);
    }
  });

  return object as TableRetrieverLastKey<M, E>;
}

export function convertPrimaryKeyToAttributeValues<M extends Metadata<E>, E extends typeof Entity>(
  entity: E,
  primaryKey: TablePrimaryKey<M, E>,
): AttributeValues {
  const dynamoObject: GenericObject = {};
  const { partitionKey, sortKey } = Dynamode.storage.getEntityMetadata(entity.name);

  dynamoObject[partitionKey] = transformValue(entity, partitionKey, (<any>primaryKey)[partitionKey]);

  if (sortKey) {
    dynamoObject[sortKey] = transformValue(entity, sortKey, (<any>primaryKey)[sortKey]);
  }

  return objectToDynamo(dynamoObject);
}
