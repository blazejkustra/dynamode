import type { Class } from 'type-fest';

import { AttributeValue } from '@aws-sdk/client-dynamodb';
import awsConverter from '@lib/Settings/aws/converter';
import { AttributeMap, GenericObject } from '@lib/utils';

export function objectToDynamo(object: GenericObject): AttributeMap {
  return awsConverter().marshall(object, { removeUndefinedValues: true });
}

export function valueToDynamo(value: any): AttributeValue {
  return awsConverter().convertToAttr(value, { convertEmptyValues: true });
}

export function fromDynamo(object: AttributeMap): GenericObject {
  return awsConverter().unmarshall(object);
}

export function classToObject(instance: InstanceType<Class<any>>, extra?: GenericObject): GenericObject {
  return { ...instance, ...extra } as GenericObject;
}
