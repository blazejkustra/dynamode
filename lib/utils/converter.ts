import { AttributeValue } from '@aws-sdk/client-dynamodb';
import ddbConverter from '@lib/dynamode/converter';
import { AttributeMap, GenericObject } from '@lib/utils';

export function objectToDynamo(object: GenericObject): AttributeMap {
  return ddbConverter.get().marshall(object, { removeUndefinedValues: true });
}

export function valueToDynamo(value: any): AttributeValue {
  return ddbConverter.get().convertToAttr(value);
}

export function valueFromDynamo(value: AttributeValue): unknown {
  return ddbConverter.get().convertToNative(value);
}

export function fromDynamo(object: AttributeMap): GenericObject {
  return ddbConverter.get().unmarshall(object);
}
