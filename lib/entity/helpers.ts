import { ReturnValue as DynamoReturnValue, ReturnValuesOnConditionCheckFailure as DynamoReturnValueOnFailure } from '@aws-sdk/client-dynamodb';
import Condition from '@lib/condition';
import { Dynamode } from '@lib/dynamode';
import { Entity } from '@lib/entity';
import type {
  BuildDeleteConditionExpression,
  BuildGetProjectionExpression,
  BuildPutConditionExpression,
  BuildUpdateConditionExpression,
  EntityKey,
  EntityMetadata,
  EntityPrimaryKey,
  ReturnValues,
  ReturnValuesLimited,
  UpdateProps,
} from '@lib/entity/types';
import {
  AttributeNames,
  AttributeValues,
  BASE_OPERATOR,
  DefaultError,
  duplicatesInArray,
  ExpressionBuilder,
  fromDynamo,
  GenericObject,
  insertBetween,
  isNotEmpty,
  isNotEmptyArray,
  objectToDynamo,
  Operators,
  UPDATE_OPERATORS,
} from '@lib/utils';

export function buildProjectionExpression<E extends typeof Entity>(entity: E, attributes: Array<EntityKey<E>>, attributeNames: AttributeNames): string {
  if (duplicatesInArray(attributes)) {
    throw new DefaultError();
  }

  const uniqueAttributes = Array.from(new Set([...attributes, 'dynamodeEntity']));
  const operators: Operators = uniqueAttributes.map((attribute) => ({
    key: String(attribute),
  }));
  return new ExpressionBuilder({ attributeNames }).run(insertBetween(operators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]));
}

export function buildGetProjectionExpression<E extends typeof Entity>(entity: E, attributes?: Array<EntityKey<E>>): BuildGetProjectionExpression {
  if (!attributes) {
    return {};
  }

  const attributeNames: AttributeNames = {};

  return {
    projectionExpression: buildProjectionExpression(entity, attributes, attributeNames),
    attributeNames: isNotEmpty(attributeNames) ? attributeNames : undefined,
  };
}

export function buildUpdateConditionExpression<E extends typeof Entity>(props: UpdateProps<E>, optionsCondition?: Condition<E>): BuildUpdateConditionExpression {
  const expressionsBuilder = new ExpressionBuilder();
  const operators = buildUpdateConditions(props);

  return {
    updateExpression: expressionsBuilder.run(operators),
    conditionExpression: optionsCondition ? expressionsBuilder.run(optionsCondition['operators']) : undefined,
    attributeNames: expressionsBuilder.attributeNames,
    attributeValues: expressionsBuilder.attributeValues,
  };
}

export function buildUpdateConditions<E extends typeof Entity>(props: UpdateProps<E>): Operators {
  const operators: Operators = [];

  if (
    isNotEmpty({
      ...(props.set || {}),
      ...(props.setIfNotExists || {}),
      ...(props.listAppend || {}),
      ...(props.increment || {}),
      ...(props.decrement || {}),
    })
  ) {
    const setOperators: Operators = [
      ...Object.entries(props.set || {}).flatMap(([key, value]) => UPDATE_OPERATORS.set(key, value)),
      ...Object.entries(props.setIfNotExists || {}).flatMap(([key, value]) => UPDATE_OPERATORS.setIfNotExists(key, value)),
      ...Object.entries(props.listAppend || {}).flatMap(([key, value]) => UPDATE_OPERATORS.listAppend(key, value)),
      ...Object.entries(props.increment || {}).flatMap(([key, value]) => UPDATE_OPERATORS.increment(key, value)),
      ...Object.entries(props.decrement || {}).flatMap(([key, value]) => UPDATE_OPERATORS.decrement(key, value)),
    ];

    operators.push(BASE_OPERATOR.set, BASE_OPERATOR.space, ...insertBetween(setOperators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]));
  }

  if (props.add && isNotEmpty(props.add)) {
    const addOperators: Operators = Object.entries(props.add).flatMap(([key, value]) => UPDATE_OPERATORS.add(key, value));
    if (operators.length) operators.push(BASE_OPERATOR.space);
    operators.push(BASE_OPERATOR.add, BASE_OPERATOR.space, ...insertBetween(addOperators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]));
  }

  if (props.delete && isNotEmpty(props.delete)) {
    const deleteOperators: Operators = Object.entries(props.delete).flatMap(([key, value]) => UPDATE_OPERATORS.delete(key, value));
    if (operators.length) operators.push(BASE_OPERATOR.space);
    operators.push(BASE_OPERATOR.delete, BASE_OPERATOR.space, ...insertBetween(deleteOperators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]));
  }

  if (isNotEmptyArray(props.remove)) {
    const removeOperators: Operators = props.remove.flatMap((key) => UPDATE_OPERATORS.remove(String(key)));
    if (operators.length) operators.push(BASE_OPERATOR.space);
    operators.push(BASE_OPERATOR.remove, BASE_OPERATOR.space, ...insertBetween(removeOperators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]));
  }

  return operators;
}

export function buildPutConditionExpression<E extends typeof Entity>(overwriteCondition?: Condition<E>, optionsCondition?: Condition<E>): BuildPutConditionExpression {
  const expressionsBuilder = new ExpressionBuilder();
  const conditions = overwriteCondition?.condition(optionsCondition) || optionsCondition?.condition(overwriteCondition);

  return {
    conditionExpression: expressionsBuilder.run(conditions?.['operators'] || []),
    attributeNames: expressionsBuilder.attributeNames,
    attributeValues: expressionsBuilder.attributeValues,
  };
}

export function buildDeleteConditionExpression<E extends typeof Entity>(notExistsCondition?: Condition<E>, optionsCondition?: Condition<E>): BuildDeleteConditionExpression {
  const expressionsBuilder = new ExpressionBuilder();
  const conditions = notExistsCondition?.condition(optionsCondition) || optionsCondition?.condition(notExistsCondition);

  return {
    conditionExpression: expressionsBuilder.run(conditions?.['operators'] || []),
    attributeNames: expressionsBuilder.attributeNames,
    attributeValues: expressionsBuilder.attributeValues,
  };
}

export function mapReturnValues(returnValues?: ReturnValues): DynamoReturnValue {
  if (!returnValues) {
    return DynamoReturnValue.ALL_NEW;
  }

  return (
    {
      none: DynamoReturnValue.NONE,
      allOld: DynamoReturnValue.ALL_OLD,
      allNew: DynamoReturnValue.ALL_NEW,
      updatedOld: DynamoReturnValue.UPDATED_OLD,
      updatedNew: DynamoReturnValue.UPDATED_NEW,
    } as const
  )[returnValues];
}

export function mapReturnValuesLimited(returnValues?: ReturnValuesLimited): DynamoReturnValueOnFailure {
  if (!returnValues) {
    return DynamoReturnValueOnFailure.ALL_OLD;
  }

  return (
    {
      none: DynamoReturnValueOnFailure.NONE,
      allOld: DynamoReturnValueOnFailure.ALL_OLD,
    } as const
  )[returnValues];
}

export function convertAttributeValuesToEntity<E extends typeof Entity>(entity: E, dynamoItem: AttributeValues): InstanceType<E> {
  const object = fromDynamo(dynamoItem);
  const attributes = Dynamode.storage.getEntityAttributes(entity.tableName, entity.name);
  const { createdAt, updatedAt } = Dynamode.storage.getTableMetadata(entity.tableName);

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

export function convertEntityToAttributeValues<E extends typeof Entity>(entity: E, item: InstanceType<E>): AttributeValues {
  const dynamoObject: GenericObject = {};
  const attributes = Dynamode.storage.getEntityAttributes(entity.tableName, entity.name);

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

export function convertAttributeValuesToPrimaryKey<EM extends EntityMetadata, E extends typeof Entity>(entity: E, dynamoItem: AttributeValues): EntityPrimaryKey<EM, E> {
  const object = fromDynamo(dynamoItem);
  const { partitionKey, sortKey } = Dynamode.storage.getTableMetadata(entity.tableName);

  if (partitionKey) {
    object[partitionKey] = truncateValue(entity, partitionKey as EntityKey<E>, object[partitionKey]);
  }
  if (sortKey) {
    object[sortKey] = truncateValue(entity, sortKey as EntityKey<E>, object[sortKey]);
  }

  return object as EntityPrimaryKey<EM, E>;
}

export function convertPrimaryKeyToAttributeValues<EM extends EntityMetadata, E extends typeof Entity>(entity: E, primaryKey: EntityPrimaryKey<EM, E>): AttributeValues {
  const dynamoObject: GenericObject = {};
  const { partitionKey, sortKey } = Dynamode.storage.getTableMetadata(entity.tableName);

  if (partitionKey) {
    dynamoObject[partitionKey] = prefixSuffixValue(entity, partitionKey as EntityKey<E>, (<any>primaryKey)[partitionKey]);
  }
  if (sortKey) {
    dynamoObject[sortKey] = prefixSuffixValue(entity, sortKey as EntityKey<E>, (<any>primaryKey)[sortKey]);
  }

  return objectToDynamo(dynamoObject);
}

export function prefixSuffixValue<E extends typeof Entity>(entity: E, key: EntityKey<E>, value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const attributes = Dynamode.storage.getEntityAttributes(entity.tableName, entity.name);
  const separator = Dynamode.separator.get();
  const prefix = attributes[String(key)].prefix || '';
  const suffix = attributes[String(key)].suffix || '';

  return [prefix, value, suffix].filter((p) => p).join(separator);
}

export function truncateValue<E extends typeof Entity>(entity: E, key: EntityKey<E>, value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const attributes = Dynamode.storage.getEntityAttributes(entity.tableName, entity.name);
  const separator = Dynamode.separator.get();
  const prefix = attributes[String(key)].prefix || '';
  const suffix = attributes[String(key)].suffix || '';

  return value.replace(`${prefix}${separator}`, '').replace(`${separator}${suffix}`, '');
}
