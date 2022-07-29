import type { Class } from 'type-fest';

import awsConverter from '@aws/converter';
import { AttributeMap, GenericObject } from '@lib/utils';

export const SYMBOL = '#';

export function objectToDynamo(object: GenericObject): AttributeMap {
  return awsConverter().marshall(object, { removeUndefinedValues: true });
}
export function fromDynamo(object: AttributeMap): GenericObject {
  return awsConverter().unmarshall(object);
}

export function classToObject(instance: InstanceType<Class<any>>, extra?: GenericObject): GenericObject {
  return { ...instance, ...extra } as GenericObject;
}

export function removeUndefinedInObject(object: Record<string, unknown>): void {
  Object.keys(object).forEach((key) => object[key] === undefined && delete object[key]);
}
