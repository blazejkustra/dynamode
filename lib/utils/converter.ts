import { AttributeValue } from '@aws-sdk/client-dynamodb';
import awsConverter from '@lib/dynamode/aws/converter';
import { AttributeMap, GenericObject } from '@lib/utils';

export function objectToDynamo(object: GenericObject): AttributeMap {
  return awsConverter().marshall(object, { removeUndefinedValues: true });
}

export function valueToDynamo(value: any): AttributeValue {
  return awsConverter().convertToAttr(value);
}

export function valueFromDynamo(value: AttributeValue): unknown {
  return awsConverter().convertToNative(value);
}

export function fromDynamo(object: AttributeMap): GenericObject {
  return awsConverter().unmarshall(object);
}
