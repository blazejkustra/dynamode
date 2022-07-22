import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { Model } from '../Model';
import awsConverter from '../aws/converter';
import { Table } from '../Table';
import { CompositeKey, KeyType, SimpleKey } from '../Table/types';

export type AttributeMap = Record<string, AttributeValue>;
export type GenericObject = Record<string, unknown>;
export type Class = { new (...args: any[]): any };

export function objectToDynamo(object: GenericObject): AttributeMap {
  return awsConverter().marshall(object, { removeUndefinedValues: true });
}
export function fromDynamo(object: AttributeMap): GenericObject {
  return awsConverter().unmarshall(object);
}

export function modelToDynamo<M extends typeof Model>(model: InstanceType<M>, table: Table): AttributeMap {
  const object = classToObject(model);
  convertPrimaryKeyInObject(object, table);
  removeUndefinedInObject(object);
  return awsConverter().marshall(object, { removeUndefinedValues: true });
}

export function classToObject(instance: InstanceType<Class>): GenericObject {
  return { ...instance } as GenericObject;
}

export function removeUndefinedInObject(object: Record<string, unknown>): void {
  Object.keys(object).forEach((key) => object[key] === undefined && delete object[key]);
}

export function convertPrimaryKeyInObject(object: Record<string, unknown>, table: Table): void {
  object[table.primaryKey.pk] = object.pk;
  if (table.primaryKey.keyType === KeyType.COMPOSITE) {
    object[table.primaryKey.sk] = object.sk;
  }

  delete object.pk;
  delete object.sk;
}

export function convertPrimaryKey(key: SimpleKey | CompositeKey, table: Table): GenericObject {
  if (table.primaryKey.keyType === KeyType.COMPOSITE && 'sk' in key) {
    return {
      [table.primaryKey.pk]: key.pk,
      [table.primaryKey.sk]: key.sk,
    };
  }

  return {
    [table.primaryKey.pk]: key.pk,
  };
}
