import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import { transformValue, truncateValue } from '@lib/entity/helpers/transformValues';
import { Metadata, TablePrimaryKey, TableRetrieverLastKey } from '@lib/table/types';
import { AttributeValues, fromDynamo, GenericObject, objectToDynamo } from '@lib/utils';

export function convertAttributeValuesToEntity<E extends typeof Entity>(
  entity: E,
  dynamoItem: AttributeValues,
  selectedAttributes?: Array<string>,
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

  const instance = new entity(object) as InstanceType<E>;

  if (selectedAttributes && selectedAttributes.length > 0) {
    Object.values(attributes)
      .filter(
        (attribute) =>
          !selectedAttributes.includes(attribute.propertyName) && attribute.propertyName !== 'dynamodeEntity',
      )
      .forEach((attribute) => {
        // @ts-expect-error undefined is not assignable to every Entity's property
        instance[attribute.propertyName] = undefined;
      });
  }

  return instance;
}

export function convertEntityToAttributeValues<E extends typeof Entity>(
  entity: E,
  item: InstanceType<E>,
): AttributeValues {
  const dynamoObject: GenericObject = {};
  const attributes = Dynamode.storage.getEntityAttributes(entity.name);

  console.log(`%%% attributes`, attributes);

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
  primaryKey: TableRetrieverLastKey<M, E> | TablePrimaryKey<M, E>,
): AttributeValues {
  const dynamoObject: GenericObject = {};
  const { partitionKey, sortKey } = Dynamode.storage.getEntityMetadata(entity.name);

  dynamoObject[partitionKey] = transformValue(
    entity,
    partitionKey,
    primaryKey[partitionKey as keyof typeof primaryKey],
  );

  if (sortKey) {
    dynamoObject[sortKey] = transformValue(entity, sortKey, primaryKey[sortKey as keyof typeof primaryKey]);
  }

  return objectToDynamo(dynamoObject);
}

export function convertRetrieverLastKeyToAttributeValues<M extends Metadata<E>, E extends typeof Entity>(
  entity: E,
  lastKey: TableRetrieverLastKey<M, E>,
): AttributeValues {
  const dynamoObject: GenericObject = {};
  const { indexes } = Dynamode.storage.getEntityMetadata(entity.name);

  Object.values(indexes ?? {}).forEach((index) => {
    if (index.partitionKey) {
      dynamoObject[index.partitionKey] = transformValue(
        entity,
        index.partitionKey,
        lastKey[index.partitionKey as keyof typeof lastKey],
      );
    }

    if (index.sortKey) {
      dynamoObject[index.sortKey] = transformValue(
        entity,
        index.sortKey,
        lastKey[index.sortKey as keyof typeof lastKey],
      );
    }
  });

  return { ...convertPrimaryKeyToAttributeValues(entity, lastKey), ...objectToDynamo(dynamoObject) };
}
